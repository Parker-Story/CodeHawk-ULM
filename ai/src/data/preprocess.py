"""
preprocess.py
"""

import os
import re
import numpy as np
import pandas as pd
import json

from src.utils.save_load import save_norm_stats

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR    = os.path.join(BASE_DIR, "models")

# ── Feature names (25 features) ───────────────────────────────

FEATURE_NAMES = [

    # Line ratios (4)
    "blank_ratio",
    "comment_ratio",
    "code_ratio",
    "avg_line_length",

    # Indentation (3)  ← mixed_indent removed
    "indent_std",
    "indent_mean",
    "indent_max",

    # Naming style (4)  ← camel_case removed (often redundant in Python corpora)
    "avg_identifier_length",
    "long_identifier_ratio",
    "snake_case_ratio",
    "single_char_var_ratio",

    # Comments & docs (4)  ← reduced (merged signal behavior)
    "docstring_ratio",
    "inline_comment_ratio",
    "has_module_docstring",
    "todo_count",

    # Functions & structure (5)  ← cyclomatic_per_function removed (often unstable/div by 0)
    "avg_function_length",
    "max_nesting_depth",
    "avg_nesting_depth",
    "early_return_ratio",
    "function_density",

    # Complexity & style (4)  ← reduced feature set
    "magic_number_density",
    "string_literal_density",
    "exception_density",
    "operator_density",

    # Lexical diversity (2)
    "unique_token_ratio",
    "avg_tokens_per_line",
]

N_FEATURES = len(FEATURE_NAMES)


# ══════════════════════════════════════════════════════════════════════════════
#  Helpers
# ══════════════════════════════════════════════════════════════════════════════

def _is_comment_line(line: str) -> bool:
    s = line.strip()
    return bool(s) and s.startswith(("#", "//", "*", "/*", "*/", "--"))


def _get_indent(line: str) -> int:
    return len(line) - len(line.lstrip())


def _tokenise(code: str) -> list:
    return re.findall(r"[a-zA-Z_]\w*|[0-9]+|\S", code)


def extract_features(code: str) -> np.ndarray:
    code  = str(code)
    lines = code.splitlines()
    n     = max(len(lines), 1)

    blank_ln   = sum(1 for ln in lines if ln.strip() == "")
    comment_ln = sum(1 for ln in lines if _is_comment_line(ln))
    code_ln    = sum(1 for ln in lines if ln.strip() and not _is_comment_line(ln))
    nonempty   = [ln for ln in lines if ln.strip()]

    blank_ratio   = blank_ln / n
    comment_ratio = comment_ln / n
    code_ratio    = code_ln / n

    # ── line length ─────────────────────────────
    line_lens    = [len(ln) for ln in lines] if lines else [0]
    avg_line_len = np.log1p(np.mean(line_lens)) / np.log1p(200)

    # ── indentation ─────────────────────────────
    indents    = [_get_indent(ln) for ln in nonempty] if nonempty else [0]

    indent_std  = np.tanh(np.std(indents) / 4)
    indent_mean = np.tanh(np.mean(indents) / 4)
    indent_max  = np.tanh(np.max(indents) / 8)

    tab_ln      = sum(1 for ln in nonempty if ln.startswith("\t"))
    space_ln    = sum(1 for ln in nonempty if ln.startswith(" "))
    mixed_ind   = float(min(tab_ln, space_ln) / max(len(nonempty), 1))

    # ── identifiers (STABILIZED) ─────────────────────────────
    identifiers = re.findall(r"\b[a-zA-Z_]\w*\b", code)
    n_ids       = max(len(identifiers), 3)

    id_lens     = [len(i) for i in identifiers] if identifiers else [0]

    avg_id_len  = np.tanh(np.mean(id_lens) / 12)

    long_id_r   = np.tanh(
        (sum(1 for l in id_lens if l > 8) / n_ids) * 1.5
    )

    snake_r     = np.tanh(
        len([i for i in identifiers if "_" in i and i.islower()]) / n_ids
    )

    camel_r     = np.tanh(
        len(re.findall(r"\b[a-z][a-zA-Z]*[A-Z][a-zA-Z]*\b", code)) / n_ids
    )

    single_r    = sum(1 for i in identifiers if len(i) == 1) / n_ids

    naming_entropy = -(
        snake_r * np.log(snake_r + 1e-8) +
        camel_r * np.log(camel_r + 1e-8) +
        (1 - snake_r - camel_r) * np.log(1 - snake_r - camel_r + 1e-8)
    )

    # ── functions (FIXED) ─────────────────────────────
    func_count = max(len(re.findall(r"\bdef\s+\w+", code)), 1)

    docstrings   = re.findall(r'""".*?"""|\'\'\'.*?\'\'\'', code, re.DOTALL)
    docstring_r  = len(docstrings) / func_count

    # ── comments ─────────────────────────────
    inline_cmt = sum(
        1 for ln in lines
        if not _is_comment_line(ln) and ("#" in ln or "//" in ln)
    )
    inline_cmt_r = np.tanh(inline_cmt / n)

    has_mod_doc = float(bool(re.match(r'\s*"""|\'\'\'', code)))

    cmt_texts    = [ln.strip().lstrip("#/").strip() for ln in lines if _is_comment_line(ln)]
    cmt_word_avg = float(np.mean([len(c.split()) for c in cmt_texts]) if cmt_texts else 0.0)

    todo_cnt = float(len(re.findall(r"\bTODO\b|\bFIXME\b|\bHACK\b|\bXXX\b", code, re.IGNORECASE)))

    # ── function structure ─────────────────────────────
    func_lines, in_func, start_i = [], False, 0
    for i, ln in enumerate(lines):
        if re.match(r"\s*def\s+\w+", ln):
            if in_func:
                func_lines.append(i - start_i)
            in_func, start_i = True, i

    if in_func:
        func_lines.append(len(lines) - start_i)

    avg_func_len = np.log1p(np.mean(func_lines) if func_lines else n) / np.log1p(100)

    depth_vals = [_get_indent(ln) // 4 for ln in lines if ln.strip()]
    max_nest   = np.tanh(max(depth_vals) / 6) if depth_vals else 0.0
    avg_nest   = np.tanh(np.mean(depth_vals) / 4) if depth_vals else 0.0

    structure_complexity = np.tanh(
        avg_func_len + max_nest + avg_nest
    )

    # ── control flow ─────────────────────────────
    early_ret = float(len(re.findall(r"\breturn\b", code)))
    early_ret_r = early_ret / func_count

    cyclo = float(sum(len(re.findall(p, code)) for p in [
        r"\bif\b", r"\belif\b", r"\bfor\b", r"\bwhile\b",
        r"\bcase\b", r"\bcatch\b", r"\bexcept\b",
        r"&&", r"\|\|", r"\band\b", r"\bor\b",
    ]))

    cyclo_per_func = np.log1p(cyclo / func_count) / np.log1p(50)

    # ── densities ─────────────────────────────
    magic_nums  = float(len(re.findall(r"(?<![A-Z_=])\b[2-9]\d*\b(?!\s*[=])", code)))
    string_lits = float(len(re.findall(r'"[^"]*"|\'[^\']*\'', code)))
    type_hints  = float(len(re.findall(r":\s*(int|str|float|bool|list|dict|tuple|set|Optional|Union|Any|None)\b", code)))
    except_cnt  = float(len(re.findall(r"\bexcept\b|\bcatch\b", code)))
    list_comps  = float(len(re.findall(r"\[.+\bfor\b.+\bin\b", code)))

    magic_density  = magic_nums / n
    string_density = string_lits / n
    type_hint_r    = type_hints / func_count
    except_density  = except_cnt / n
    list_comp_dens  = list_comps / n

    # ── tokens ─────────────────────────────
    tokens     = _tokenise(code)
    total_toks = max(float(len(tokens)), 1.0)

    unique_ratio = float(len(set(t.lower() for t in tokens))) / total_toks
    toks_per_ln  = np.tanh((total_toks / n) / 20)
    op_density   = float(len(re.findall(r"[+\-*/=<>!&|^~%]+", code))) / total_toks

    # ── FINAL FEATURE VECTOR ─────────────────────────────
    features = [
        blank_ratio, comment_ratio, code_ratio, avg_line_len,
        indent_std, indent_mean, indent_max, mixed_ind,

        naming_entropy,

        docstring_r, inline_cmt_r, has_mod_doc, cmt_word_avg, todo_cnt,

        structure_complexity, early_ret_r,

        cyclo_per_func,

        magic_density, string_density, type_hint_r,
        except_density, list_comp_dens, op_density,

        unique_ratio, toks_per_ln
    ]

    arr = np.array(features, dtype=np.float32)
    return np.nan_to_num(arr, nan=0.0, posinf=0.0, neginf=0.0)


def extract_feature_matrix(codes: list) -> np.ndarray:
    return np.stack([extract_features(c) for c in codes], axis=0)


# ══════════════════════════════════════════════════════════════════════════════
#  Data loading
# ══════════════════════════════════════════════════════════════════════════════

def load_all_sources() -> pd.DataFrame:
    RAW_SOURCES = [
        {
            "path":        os.path.join(BASE_DIR, "data", "raw", "human",
                                        "human_selected_dataset.csv"),
            "force_label": 0,
            "name":        "Human (raw)",
        },
        {
            "path":        os.path.join(BASE_DIR, "data", "raw", "ai",
                                        "created_dataset_with_llms.csv"),
            "force_label": 1,
            "name":        "AI (raw)",
        },
        {
            "path":        os.path.join(BASE_DIR, "data", "raw", "human_and_ai",
                                        "HumanVsAI_CodeDataset.csv"),
            "force_label": None,
            "name":        "Human vs AI (combined)",
        },
    ]

    frames = []
    for src in RAW_SOURCES:
        if not os.path.exists(src["path"]):
            print(f"[load_all_sources] SKIPPED (not found): {src['path']}")
            continue

        df = pd.read_csv(src["path"], low_memory=False)

        code_col = next((c for c in ["code", "Sample_Code"] if c in df.columns), None)
        if not code_col:
            print(f"[load_all_sources] SKIPPED (no code col): {src['path']}")
            continue

        if src["force_label"] is not None:
            df = df[[code_col]].copy()
            df.rename(columns={code_col: "code"}, inplace=True)
            df["label"] = src["force_label"]
        else:
            label_col = next((c for c in ["label", "Generated"] if c in df.columns), None)
            if not label_col:
                print(f"[load_all_sources] SKIPPED (no label col): {src['path']}")
                continue
            df = df[[code_col, label_col]].copy()
            df.rename(columns={code_col: "code"}, inplace=True)
            if label_col == "Generated":
                df["label"] = df["Generated"].map({"Human": 0, "AI": 1})
                df.drop(columns=["Generated"], inplace=True)

        df.dropna(subset=["code", "label"], inplace=True)
        df = df[df["code"].astype(str).str.strip() != ""]
        frames.append(df)
        print(f"[load_all_sources] {len(df):>6} rows <- {src['name']}")

    if not frames:
        raise RuntimeError("No valid data sources found.")

    combined = pd.concat(frames, ignore_index=True)
    before   = len(combined)
    combined.reset_index(drop=True, inplace=True)

    n_h = int((combined["label"] == 0).sum())
    n_a = int((combined["label"] == 1).sum())
    print(f"\n[load_all_sources] {len(combined)} unique rows "
          f"({before - len(combined)} dupes removed) | Human={n_h}  AI={n_a}\n")
    return combined


# ══════════════════════════════════════════════════════════════════════════════
#  Normalisation with percentile clipping
# ══════════════════════════════════════════════════════════════════════════════

def normalise(X_train: np.ndarray,
              X_test:  np.ndarray,
              save_dir: str = MODELS_DIR) -> tuple:
    """
    Clip each feature to [p1, p99] of the training distribution FIRST,
    then z-score normalise.  Prevents one extreme sample from dominating
    the normalised range.
    """
    os.makedirs(save_dir, exist_ok=True)

    # Compute percentile clips on training data only
    p1  = np.percentile(X_train, 1,  axis=0)
    p99 = np.percentile(X_train, 99, axis=0)

    X_train_c = np.clip(X_train, p1, p99)
    X_test_c  = np.clip(X_test,  p1, p99)   # use training clips on test

    mean = X_train_c.mean(axis=0)
    std  = X_train_c.std(axis=0)
    std  = np.where(std == 0, 1.0, std)

    X_train_n = (X_train_c - mean) / std
    X_test_n  = (X_test_c  - mean) / std

    # Save everything needed at inference time
    from src.utils.save_load import save_norm_stats
    save_norm_stats(mean, std, save_dir)

    # Also save clip bounds
    np.save(os.path.join(save_dir, "clip_p1.npy"),  p1)
    np.save(os.path.join(save_dir, "clip_p99.npy"), p99)
    print(f"[normalise] Saved mean/std + clip bounds -> {save_dir}")

    return X_train_n, X_test_n, mean, std


# ══════════════════════════════════════════════════════════════════════════════
#  pos_weight computation  (replaces oversampling)
# ══════════════════════════════════════════════════════════════════════════════

def compute_and_save_pos_weight(y_train: np.ndarray,
                                 save_dir: str = MODELS_DIR) -> float:
    """
    pos_weight = n_negative / n_positive
    Used in BCE loss to up-weight the minority class without duplicating data.
    Saved to JSON so train.py can load it.
    """
    n_neg = float((y_train == 0).sum())
    n_pos = float((y_train == 1).sum())
    pw    = n_neg / max(n_pos, 1.0)
    pw    = float(np.clip(pw, 0.5, 4.0))   # don't let it go extreme

    path = os.path.join(save_dir, "pos_weight.json")
    with open(path, "w") as f:
        json.dump({"pos_weight": pw}, f)
    print(f"[compute_pos_weight] pos_weight={pw:.3f} -> {path}")
    return pw


def load_pos_weight(save_dir: str = MODELS_DIR) -> float:
    path = os.path.join(save_dir, "pos_weight.json")
    if not os.path.exists(path):
        return 1.0
    with open(path) as f:
        return float(json.load(f)["pos_weight"])


# ══════════════════════════════════════════════════════════════════════════════
#  Save / load processed arrays
# ══════════════════════════════════════════════════════════════════════════════

def save_processed(X_train, X_test, y_train, y_test,
                   out_dir: str = PROCESSED_DIR) -> None:
    os.makedirs(out_dir, exist_ok=True)
    for name, arr in [("X_train", X_train), ("X_test",  X_test),
                      ("y_train", y_train), ("y_test",  y_test)]:
        np.save(os.path.join(out_dir, f"{name}.npy"), arr)
    print(f"[save_processed] -> {out_dir}")


def load_processed(out_dir: str = PROCESSED_DIR) -> tuple:
    arrs = [np.load(os.path.join(out_dir, f"{n}.npy"))
            for n in ("X_train", "X_test", "y_train", "y_test")]
    print(f"[load_processed] <- {out_dir}")
    return tuple(arrs)


# ══════════════════════════════════════════════════════════════════════════════
#  Full pipeline
# ══════════════════════════════════════════════════════════════════════════════

def run_preprocessing() -> tuple:
    """
    Pipeline:
      1. Load raw CSVs
      2. Stratified split (test = real distribution, no balancing)
      3. Extract 32 scale-invariant features
      4. Clip + normalise (fit on train only)
      5. Compute pos_weight from training labels (no oversampling)
      6. Save everything
    """
    df = load_all_sources()
    y  = df["label"].to_numpy(dtype=np.float32)

    # Stratified split
    rng = np.random.default_rng(42)
    train_idx, test_idx = [], []
    for cls in np.unique(y):
        idx    = rng.permutation(np.where(y == cls)[0])
        n_test = max(1, int(len(idx) * 0.2))
        test_idx.extend(idx[:n_test].tolist())
        train_idx.extend(idx[n_test:].tolist())

    train_df = df.iloc[rng.permutation(train_idx)].reset_index(drop=True)
    test_df  = df.iloc[rng.permutation(test_idx)].reset_index(drop=True)

    # NO oversampling — use pos_weight in loss instead
    n_h_tr = int((train_df["label"] == 0).sum())
    n_a_tr = int((train_df["label"] == 1).sum())
    print(f"[run_preprocessing] Train: Human={n_h_tr}  AI={n_a_tr}  "
          f"ratio={max(n_h_tr,n_a_tr)/max(min(n_h_tr,n_a_tr),1):.2f}")
    print(f"[run_preprocessing] Test:  "
          f"Human={int((test_df['label']==0).sum())}  "
          f"AI={int((test_df['label']==1).sum())}")

    train_codes = train_df["code"].astype(str).tolist()
    test_codes  = test_df["code"].astype(str).tolist()
    y_train     = train_df["label"].to_numpy(dtype=np.float32)
    y_test      = test_df["label"].to_numpy(dtype=np.float32)

    print("\n[run_preprocessing] Extracting features ...")
    X_train = extract_feature_matrix(train_codes)
    X_test  = extract_feature_matrix(test_codes)

    print(f"[run_preprocessing] train={X_train.shape}  test={X_test.shape}")

    # Clip + normalise
    X_train, X_test, _, _ = normalise(X_train, X_test, MODELS_DIR)

    # Compute pos_weight (no oversampling)
    compute_and_save_pos_weight(y_train, MODELS_DIR)

    save_processed(X_train, X_test, y_train, y_test, PROCESSED_DIR)
    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    run_preprocessing()
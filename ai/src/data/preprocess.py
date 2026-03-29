"""
preprocess.py

40 hand-crafted features that capture real AI vs human
code differences based on style, structure, and complexity patterns.

Features:
  - Structural patterns (indentation, line length, nesting)
  - Style patterns (naming, comments, docstrings)
  - Complexity patterns (function size, branching, cyclomatic)
  - Lexical diversity (unique token ratio)
  - AI-specific tells (magic numbers, type hints, error handling style)
"""

import os
import re
import numpy as np
import pandas as pd

from src.utils.save_load import save_norm_stats

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))



PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR    = os.path.join(BASE_DIR, "models")

# Feature names in extraction order — used for debugging/inspection
FEATURE_NAMES = [
    # ── Line structure (8) ───────────────────────────────────────────────────
    "total_lines",
    "code_lines",
    "blank_lines",
    "comment_lines",
    "blank_ratio",
    "comment_ratio",
    "avg_line_length",
    "line_length_std",

    # ── Indentation (4) ──────────────────────────────────────────────────────
    "indent_std",               # AI: very uniform; human: varies
    "indent_mean",
    "indent_max",
    "mixed_indent",             # tabs vs spaces mixing (human habit)

    # ── Naming style (5) ─────────────────────────────────────────────────────
    "avg_identifier_length",    # AI: longer descriptive names
    "long_identifier_ratio",    # ratio of identifiers > 8 chars
    "snake_case_ratio",         # AI follows conventions strictly
    "camel_case_count",
    "single_char_var_ratio",    # humans use i, j, x more often

    # ── Comments & docs (5) ──────────────────────────────────────────────────
    "docstring_count",          # AI writes docstrings consistently
    "inline_comment_ratio",     # AI adds inline comments more
    "todo_count",               # humans leave TODOs, AI rarely does
    "comment_word_count_avg",   # AI comments are more verbose
    "has_module_docstring",     # AI almost always adds module docstring

    # ── Functions & structure (6) ────────────────────────────────────────────
    "function_count",
    "avg_function_length",      # AI writes shorter, cleaner functions
    "max_function_length",
    "max_nesting_depth",        # AI avoids deep nesting
    "avg_nesting_depth",
    "early_return_ratio",       # AI uses early returns more

    # ── Complexity & style (6) ───────────────────────────────────────────────
    "cyclomatic_complexity",    # if/for/while/elif branches
    "magic_number_count",       # raw numbers not assigned to vars (human habit)
    "string_literal_count",     # AI adds more descriptive strings
    "type_hint_count",          # AI uses type hints more
    "exception_handling_count", # AI wraps more in try/except
    "list_comprehension_count", # AI uses comprehensions more

    # ── Lexical diversity (4) ────────────────────────────────────────────────
    "unique_token_ratio",       # AI has less token diversity (more repetitive)
    "total_tokens",
    "avg_tokens_per_line",
    "operator_density",         # ratio of operators to total tokens

    # ── Global stats (2) ─────────────────────────────────────────────────────
    "total_chars",
    "avg_chars_per_token",
]


# ══════════════════════════════════════════════════════════════════════════════
#  Feature extractor  (40 features, all hand-crafted)
# ══════════════════════════════════════════════════════════════════════════════

def _is_comment_line(line: str) -> bool:
    s = line.strip()
    return bool(s) and s.startswith(("#", "//", "*", "/*", "*/", "--"))


def _get_indent(line: str) -> int:
    return len(line) - len(line.lstrip())


def _max_nesting(code: str) -> tuple:
    """Return (max_depth, avg_depth) based on indentation levels."""
    depths = []
    for ln in code.splitlines():
        if ln.strip():
            depths.append(_get_indent(ln) // 4)   # assume 4-space indent
    if not depths:
        return 0, 0.0
    return int(max(depths)), float(np.mean(depths))


def _function_lengths(code: str) -> list:
    """Return list of line counts per function/method."""
    lengths = []
    lines   = code.splitlines()
    in_func = False
    start   = 0

    for i, ln in enumerate(lines):
        stripped = ln.strip()
        # Detect function start (Python / C-style)
        if re.match(r"def\s+\w+|^\w[\w\s\*]+\s+\w+\s*\(", stripped):
            if in_func:
                lengths.append(i - start)
            in_func = True
            start   = i

    if in_func:
        lengths.append(len(lines) - start)

    return lengths if lengths else [len(lines)]


def _cyclomatic(code: str) -> int:
    """
    Approximate cyclomatic complexity:
    count decision points (if, elif, for, while, case, catch, &&, ||)
    """
    patterns = [
        r"\bif\b", r"\belif\b", r"\bfor\b", r"\bwhile\b",
        r"\bcase\b", r"\bcatch\b", r"\bexcept\b",
        r"&&", r"\|\|", r"\band\b", r"\bor\b",
    ]
    return sum(len(re.findall(p, code)) for p in patterns)


def _tokenise_simple(code: str) -> list:
    return re.findall(r"[a-zA-Z_]\w*|[0-9]+|\S", code)


def extract_features(code: str) -> np.ndarray:
    """
    Extract all 40 features from a raw code string.
    Returns np.ndarray shape (40,) dtype float32.
    """
    code  = str(code)
    lines = code.splitlines()
    n     = len(lines)

    # ── Line structure ────────────────────────────────────────────────────────
    blank_lines   = sum(1 for ln in lines if ln.strip() == "")
    comment_lines = sum(1 for ln in lines if _is_comment_line(ln))
    code_lines    = sum(1 for ln in lines if ln.strip() and not _is_comment_line(ln))
    line_lengths  = [len(ln) for ln in lines] if lines else [0]
    avg_line_len  = float(np.mean(line_lengths))
    line_len_std  = float(np.std(line_lengths))
    blank_ratio   = blank_lines   / max(n, 1)
    comment_ratio = comment_lines / max(n, 1)

    # ── Indentation ───────────────────────────────────────────────────────────
    nonempty_lines = [ln for ln in lines if ln.strip()]
    indents = [_get_indent(ln) for ln in nonempty_lines] if nonempty_lines else [0]
    indent_std   = float(np.std(indents))
    indent_mean  = float(np.mean(indents))
    indent_max   = float(max(indents))
    # Mixed indentation: lines with tabs when most use spaces (or vice versa)
    tab_lines   = sum(1 for ln in nonempty_lines if ln.startswith("\t"))
    space_lines = sum(1 for ln in nonempty_lines if ln.startswith(" "))
    mixed_indent = float(min(tab_lines, space_lines) / max(len(nonempty_lines), 1))

    # ── Naming style ──────────────────────────────────────────────────────────
    identifiers = re.findall(r"\b[a-zA-Z_]\w*\b", code)
    id_lengths  = [len(i) for i in identifiers] if identifiers else [0]
    avg_id_len  = float(np.mean(id_lengths))
    long_id_ratio = sum(1 for l in id_lengths if l > 8) / max(len(id_lengths), 1)
    snake_ids   = [i for i in identifiers if "_" in i and i.islower()]
    snake_ratio = len(snake_ids) / max(len(identifiers), 1)
    camel_count = float(len(re.findall(r"\b[a-z][a-zA-Z]*[A-Z][a-zA-Z]*\b", code)))
    single_char = sum(1 for i in identifiers if len(i) == 1)
    single_char_ratio = single_char / max(len(identifiers), 1)

    # ── Comments & docs ───────────────────────────────────────────────────────
    docstrings     = re.findall(r'""".*?"""|\'\'\'.*?\'\'\'', code, re.DOTALL)
    docstring_count = float(len(docstrings))
    inline_comments = sum(1 for ln in lines
                          if not _is_comment_line(ln) and
                          ("#" in ln or "//" in ln))
    inline_comment_ratio = inline_comments / max(n, 1)
    todo_count = float(len(re.findall(r"\bTODO\b|\bFIXME\b|\bHACK\b|\bXXX\b",
                                       code, re.IGNORECASE)))
    comment_texts = [ln.strip().lstrip("#/").strip()
                     for ln in lines if _is_comment_line(ln)]
    comment_word_avg = float(np.mean([len(c.split()) for c in comment_texts])
                             if comment_texts else 0.0)
    has_module_doc = float(bool(re.match(r'\s*"""|\s*\'\'\'', code)))

    # ── Functions & structure ─────────────────────────────────────────────────
    func_pattern  = r"\bdef\s+\w+|\b\w[\w\s\*]+\s+\w+\s*\([^)]*\)\s*\{"
    function_count = float(len(re.findall(func_pattern, code)))
    func_lengths   = _function_lengths(code)
    avg_func_len   = float(np.mean(func_lengths))
    max_func_len   = float(max(func_lengths))
    max_nest, avg_nest = _max_nesting(code)
    early_returns  = float(len(re.findall(r"\breturn\b", code)))
    early_return_ratio = early_returns / max(function_count, 1)

    # ── Complexity & style ────────────────────────────────────────────────────
    cyclomatic   = float(_cyclomatic(code))
    # Magic numbers: standalone integers not in assignments to UPPER_CASE vars
    magic_nums   = float(len(re.findall(r"(?<![A-Z_=])\b[2-9]\d*\b(?!\s*[=])", code)))
    string_lits  = float(len(re.findall(r'"[^"]*"|\'[^\']*\'', code)))
    type_hints   = float(len(re.findall(r":\s*(int|str|float|bool|list|dict|"
                                         r"tuple|set|Optional|Union|Any|None)\b", code)))
    except_count = float(len(re.findall(r"\bexcept\b|\bcatch\b", code)))
    list_comps   = float(len(re.findall(r"\[.+\bfor\b.+\bin\b", code)))

    # ── Lexical diversity ─────────────────────────────────────────────────────
    tokens      = _tokenise_simple(code)
    total_toks  = float(len(tokens))
    unique_toks = float(len(set(t.lower() for t in tokens)))
    unique_ratio = unique_toks / max(total_toks, 1)
    toks_per_line = total_toks / max(n, 1)
    ops          = re.findall(r"[+\-*/=<>!&|^~%]+", code)
    op_density   = float(len(ops)) / max(total_toks, 1)

    # ── Global stats ──────────────────────────────────────────────────────────
    total_chars      = float(len(code))
    avg_chars_per_tok = total_chars / max(total_toks, 1)

    features = [
        # Line structure
        float(n), float(code_lines), float(blank_lines), float(comment_lines),
        blank_ratio, comment_ratio, avg_line_len, line_len_std,
        # Indentation
        indent_std, indent_mean, indent_max, mixed_indent,
        # Naming
        avg_id_len, long_id_ratio, snake_ratio, camel_count, single_char_ratio,
        # Comments & docs
        docstring_count, inline_comment_ratio, todo_count,
        comment_word_avg, has_module_doc,
        # Functions & structure
        function_count, avg_func_len, max_func_len,
        float(max_nest), float(avg_nest), early_return_ratio,
        # Complexity & style
        cyclomatic, magic_nums, string_lits, type_hints,
        except_count, list_comps,
        # Lexical diversity
        unique_ratio, total_toks, toks_per_line, op_density,
        # Global
        total_chars, avg_chars_per_tok,
    ]

    assert len(features) == len(FEATURE_NAMES), \
        f"Feature count mismatch: {len(features)} vs {len(FEATURE_NAMES)}"

    return np.array(features, dtype=np.float32)


def extract_feature_matrix(codes: list) -> np.ndarray:
    """Extract features for all code samples. Returns (N, 40) matrix."""
    matrix = np.stack([extract_features(c) for c in codes], axis=0)
    # Replace NaN/Inf with 0 (can occur on empty/malformed code)
    matrix = np.nan_to_num(matrix, nan=0.0, posinf=0.0, neginf=0.0)
    return matrix


# ══════════════════════════════════════════════════════════════════════════════
#  Data loading
# ══════════════════════════════════════════════════════════════════════════════

def load_all_sources() -> pd.DataFrame:
    RAW_SOURCES = [
        {
            "path": os.path.join(BASE_DIR, "data", "raw", "human", "human_selected_dataset.csv"),
            "force_label": 0,
            "name": "Human (raw)",
        },
        {
            "path": os.path.join(BASE_DIR, "data", "raw", "ai", "created_dataset_with_llms.csv"),
            "force_label": 1,
            "name": "AI (raw)",
        },
        {
            "path": os.path.join(BASE_DIR, "data", "raw", "human_and_ai", "HumanVsAI_CodeDataset.csv"),
            "force_label": None,
            "name": "Human vs AI (combined)",
        },
    ]

    frames = []
    for src in RAW_SOURCES:
        if not os.path.exists(src["path"]):
            print(f"[load_all_sources] SKIPPED (not found): {src['path']}")
            continue

        df = pd.read_csv(src["path"], low_memory=False)

        code_col_candidates = ["code", "Sample_Code"]
        code_col = next((c for c in code_col_candidates if c in df.columns), None)
        if not code_col:
            print(f"[load_all_sources] SKIPPED (no code col): {src['path']}")
            continue

        if src["force_label"] is not None:
            df = df[[code_col]].copy()
            df.rename(columns={code_col: "code"}, inplace=True)
            df["label"] = src["force_label"]
        else:
            # Here handle the 'Generated' column instead of 'label'
            if "label" in df.columns:
                label_col = "label"
            elif "Generated" in df.columns:
                label_col = "Generated"
            else:
                print(f"[load_all_sources] SKIPPED (no label or Generated col): {src['path']}")
                continue

            df = df[[code_col, label_col]].copy()
            df.rename(columns={code_col: "code"}, inplace=True)

            # Convert 'Generated' to numeric labels if needed
            if label_col == "Generated":
                df["label"] = df["Generated"].map({"Human": 0, "AI": 1})
                df.drop(columns=["Generated"], inplace=True)

        df.dropna(subset=["code", "label"], inplace=True)
        df = df[df["code"].astype(str).str.strip() != ""]
        frames.append(df)
        print(f"[load_all_sources] {len(df):>6} rows <- {src['name']}")

    if not frames:
        raise RuntimeError("No valid data found in raw sources!")

    combined = pd.concat(frames, ignore_index=True)
    before = len(combined)
    combined.drop_duplicates(subset=["code"], inplace=True)
    combined.reset_index(drop=True, inplace=True)

    n_h = int((combined["label"] == 0).sum())
    n_a = int((combined["label"] == 1).sum())
    print(f"\n[load_all_sources] {len(combined)} unique rows "
          f"({before - len(combined)} dupes removed) | Human={n_h}  AI={n_a}\n")
    return combined


# ══════════════════════════════════════════════════════════════════════════════
#  Class balancing
# ══════════════════════════════════════════════════════════════════════════════

def balance_classes(df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    rng  = np.random.default_rng(seed)
    df_h = df[df["label"] == 0]
    df_a = df[df["label"] == 1]
    n_h, n_a = len(df_h), len(df_a)
    ratio = max(n_h, n_a) / max(min(n_h, n_a), 1)
    print(f"[balance_classes] Human={n_h}  AI={n_a}  ratio={ratio:.2f}")
    if ratio <= 1.2:
        print("[balance_classes] Already balanced.")
        return df.sample(frac=1, random_state=seed).reset_index(drop=True)
    if n_h < n_a:
        extra = df_h.iloc[rng.choice(n_h, n_a - n_h, replace=True)]
        out   = pd.concat([df_h, extra, df_a], ignore_index=True)
    else:
        extra = df_a.iloc[rng.choice(n_a, n_h - n_a, replace=True)]
        out   = pd.concat([df_h, df_a, extra], ignore_index=True)
    out = out.sample(frac=1, random_state=seed).reset_index(drop=True)
    print(f"[balance_classes] Balanced -> "
          f"Human={int((out['label']==0).sum())}  AI={int((out['label']==1).sum())}\n")
    return out


# ══════════════════════════════════════════════════════════════════════════════
#  Normalisation
# ══════════════════════════════════════════════════════════════════════════════

def normalise(X_train, X_test, save_dir=MODELS_DIR):
    mean = X_train.mean(axis=0)
    std  = X_train.std(axis=0)
    std  = np.where(std == 0, 1.0, std)
    X_train_n = (X_train - mean) / std
    X_test_n  = (X_test  - mean) / std
    save_norm_stats(mean, std, save_dir)
    return X_train_n, X_test_n, mean, std


# ══════════════════════════════════════════════════════════════════════════════
#  Save / load
# ══════════════════════════════════════════════════════════════════════════════

def save_processed(X_train, X_test, y_train, y_test, out_dir=PROCESSED_DIR):
    os.makedirs(out_dir, exist_ok=True)
    for name, arr in [("X_train", X_train), ("X_test",  X_test),
                      ("y_train", y_train), ("y_test",  y_test)]:
        np.save(os.path.join(out_dir, f"{name}.npy"), arr)
    print(f"[save_processed] -> {out_dir}")


def load_processed(out_dir=PROCESSED_DIR):
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
      1. Load raw CSVs (deduplicated)
      2. Stratified split  (test = real unbalanced distribution)
      3. Balance TRAINING only
      4. Extract 40 hand-crafted features
      5. Normalise (fit on train)
      6. Save
    """
    df = load_all_sources()
    y  = df["label"].to_numpy(dtype=np.float32)

    # Stratified split BEFORE balancing
    rng = np.random.default_rng(42)
    train_idx, test_idx = [], []
    for cls in np.unique(y):
        idx    = rng.permutation(np.where(y == cls)[0])
        n_test = max(1, int(len(idx) * 0.2))
        test_idx.extend(idx[:n_test].tolist())
        train_idx.extend(idx[n_test:].tolist())

    train_df = df.iloc[rng.permutation(train_idx)].reset_index(drop=True)
    test_df  = df.iloc[rng.permutation(test_idx)].reset_index(drop=True)

    # Balance training set only
    train_df = balance_classes(train_df, seed=42)

    train_codes = train_df["code"].astype(str).tolist()
    test_codes  = test_df["code"].astype(str).tolist()
    y_train     = train_df["label"].to_numpy(dtype=np.float32)
    y_test      = test_df["label"].to_numpy(dtype=np.float32)

    # Extract 40 features
    print("[run_preprocessing] Extracting features (this takes ~1 min) ...")
    X_train = extract_feature_matrix(train_codes)
    X_test  = extract_feature_matrix(test_codes)

    print(f"[run_preprocessing] train={X_train.shape}  test={X_test.shape}")
    print(f"[run_preprocessing] Feature names: {FEATURE_NAMES}")

    # Normalise + save
    X_train, X_test, _, _ = normalise(X_train, X_test, MODELS_DIR)
    save_processed(X_train, X_test, y_train, y_test, PROCESSED_DIR)

    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    run_preprocessing()
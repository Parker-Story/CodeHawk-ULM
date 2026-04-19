import os
import re
import json
import numpy as np
import pandas as pd

from src.utils.save_load import save_norm_stats

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR    = os.path.join(BASE_DIR, "models")

# Keywords
# Python
PY_KW = {
    "def","return","if","elif","else","for","while","import","from","class",
    "try","except","finally","with","as","pass","break","continue","lambda",
    "yield","and","or","not","in","is","None","True","False","raise","del",
    "global","assert",
}
# C
C_KW = {
    "int","void","char","float","double","bool","long","short","unsigned",
    "struct","typedef","enum","static","const","return","if","else","for",
    "while","do","switch","case","break","continue","new","delete","public",
    "private","protected","class","this","super","import","package",
    "interface","extends","implements","String","System","null","true","false",
    "throw","throws","final","abstract",
}
# Java
JAVA_KW = {
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
    "class", "const", "continue", "default", "do", "double", "else", "enum",
    "extends", "final", "finally", "float", "for", "goto", "if", "implements",
    "import", "instanceof", "int", "interface", "long", "native", "new",
    "package", "private", "protected", "public", "return", "short", "static",
    "strictfp", "super", "switch", "synchronized", "this", "throw", "throws",
    "transient", "try", "void", "volatile", "while", "true", "false", "null"
}
ALL_KW = PY_KW | C_KW | JAVA_KW

# Features
FEATURE_NAMES = [
    # Lexical diversity
    "unique_token_ratio",       # H > AI always: real humans have more varied vocab

    # Line characteristics
    "avg_line_length",          # AI > H: consistent across competitive and assignment
    "blank_ratio",              # AI > H: AI adds blank lines for readability

    # Comment/doc patterns
    "comment_ratio",            # AI > H: AI comments more consistently
    "has_docstring",            # AI > H: AI almost always writes docstrings
    "comment_word_count_avg",   # AI > H: AI comments are more verbose

    # Control flow density
    "cyclomatic_density",       # H > AI: humans branch more in all domains
    "operator_density",         # H > AI: human code is more operator-dense

    # Keyword usage
    "keyword_density",          # H > AI: human code uses more language keywords

    # Structure
    "blank_ratio_variance",     # AI more consistent blank line distribution
    "indent_std",               # AI more uniform indentation
    "string_literal_density",   # AI > H: more string literals

    # Language
    "func_density",             # functions per line
    "early_return_density",     # returns per line
]

N_FEATURES = len(FEATURE_NAMES)  # 14


# Helpers
def is_comment_line(line: str) -> bool:
    s = line.strip()
    return bool(s) and s.startswith(("#", "//", "*", "/*", "*/", "--"))


def get_indent(line: str) -> int:
    return len(line) - len(line.lstrip())


def tokenise(code: str) -> list:
    return re.findall(r"[a-zA-Z_]\w*|[0-9]+|\S", code)


def _count_functions(code: str) -> int:
    py     = len(re.findall(r"\bdef\s+\w+", code))
    c_java = len(re.findall(
        r"\b(?:public|private|protected|static|void|int|String|double|float|"
        r"bool|char|long|auto)\s+\w+\s*\([^;]*\)\s*(?:throws\s+\w+\s*)?\{",
        code
    ))
    return max(py + c_java, 1)


# Get features
def extract_features(code: str) -> np.ndarray:
    code     = str(code)
    lines    = code.splitlines()
    n        = max(len(lines), 1)
    nonempty = [ln for ln in lines if ln.strip()]

    tokens     = tokenise(code)
    total_toks = max(float(len(tokens)), 1.0)

    # Lexical diversity
    unique_r = float(len(set(t.lower() for t in tokens))) / total_toks

    # Line characteristics
    line_lens   = [len(ln) for ln in lines] if lines else [0]
    avg_ll      = float(np.log1p(np.mean(line_lens)) / np.log1p(200))

    blank_ln    = sum(1 for ln in lines if ln.strip() == "")
    blank_ratio = blank_ln / n

    # Comment/doc patterns
    comment_ln = sum(1 for ln in lines if is_comment_line(ln))
    comment_ratio = comment_ln / n

    docstrings    = re.findall(r'""".*?"""|\'\'\'.*?\'\'\'', code, re.DOTALL)
    javadoc       = re.findall(r'/\*\*.*?\*/', code, re.DOTALL)
    has_docstring = float(len(docstrings) + len(javadoc) > 0)

    cmt_texts     = [ln.strip().lstrip("#/*-").strip() for ln in lines if is_comment_line(ln)]
    cmt_word_avg  = float(np.mean([len(c.split()) for c in cmt_texts]) if cmt_texts else 0.0)

    # Control flow
    cyclo = float(sum(len(re.findall(p, code)) for p in [
        r"\bif\b", r"\belif\b", r"\bfor\b", r"\bwhile\b",
        r"\bcase\b", r"\bcatch\b", r"\bexcept\b",
        r"&&", r"\|\|", r"\band\b", r"\bor\b",
    ]))
    cyclo_density = cyclo / n

    ops        = re.findall(r"[+\-*/=<>!&|^~%]+", code)
    op_density = float(len(ops)) / total_toks

    # Keyword density
    word_toks  = [t for t in tokens if re.match(r"[a-zA-Z]", t)]
    kw_density = sum(1 for t in word_toks if t in ALL_KW) / max(len(word_toks), 1)

    # Blank line variance (AI more regular)
    blank_flags      = [float(ln.strip() == "") for ln in lines]
    blank_variance   = float(np.var(blank_flags)) if len(blank_flags) > 1 else 0.0

    # Indentation uniformity
    indents    = [get_indent(ln) for ln in nonempty] if nonempty else [0]
    indent_std = float(np.tanh(np.std(indents) / 4.0))

    # String literals
    string_lits    = float(len(re.findall(r'"[^"]*"|\'[^\']*\'', code)))
    string_density = string_lits / n

    # Function structure
    func_count     = _count_functions(code)
    func_density   = func_count / n
    early_ret      = float(len(re.findall(r"\breturn\b", code)))
    early_ret_dens = early_ret / n

    features = [
        unique_r,
        avg_ll, blank_ratio,
        comment_ratio, has_docstring, cmt_word_avg,
        cyclo_density, op_density,
        kw_density,
        blank_variance, indent_std, string_density,
        func_density, early_ret_dens,
    ]

    assert len(features) == N_FEATURES, f"{len(features)} != {N_FEATURES}"
    return np.nan_to_num(np.array(features, dtype=np.float32),
                         nan=0.0, posinf=0.0, neginf=0.0)


def extract_feature_matrix(codes: list) -> np.ndarray:
    return np.stack([extract_features(c) for c in codes], axis=0)


# Load datasets
def load_all_sources() -> pd.DataFrame:
    raw_dir = os.path.join(BASE_DIR, "data", "raw")

    # Human sources
    human_sources = [
        {
            "path": os.path.join(raw_dir, "human", "human_style_varied_v2.csv"),
            "code_col": "code",
            "name": "Human",
            "limit": None,
        },
        {
            "path": os.path.join(raw_dir, "human", "Human_Python.csv"),
            "code_col": "code",
            "name": "Human",
            "limit": 3000,
        },
        {
            "path": os.path.join(raw_dir, "human", "Human_Java.csv"),
            "code_col": "code",
            "name": "Human",
            "limit": 3000,
        },
        {
            "path": os.path.join(raw_dir, "human", "human_code.csv"),
            "code_col": "code",
            "name": "Human",
            "limit": None,
        },
        {
            "path": os.path.join(raw_dir, "human", "code_dataset_human_like.csv"),
            "code_col": "code",
            "name": "Human",
            "limit": 1000,
        },
        {
            "path": os.path.join(raw_dir, "human", "human_selected_dataset.csv"),
            "code_col": "code",
            "name": "Human",
            "limit": 1000,
        },
    ]

    # AI sources
    ai_sources = [
        {
            "path": os.path.join(raw_dir, "ai", "llm_style_varied_v2.csv"),
            "code_col": "code",
            "name": "AI (Gemini)",
            "limit": None,
        },
        {
            "path": os.path.join(raw_dir, "ai", "AI_Python_Full_Rewritten.csv"),
            "code_col": "code",
            "name": "AI (Gemini)",
            "limit": 3000,
        },
        {
            "path": os.path.join(raw_dir, "ai", "AI_Generated_Java.csv"),
            "code_col": "code",
            "name": "AI (Gemini)",
            "limit": 3000,
        },
        {
            "path": os.path.join(raw_dir, "ai", "ai_generated_code.csv"),
            "code_col": "code",
            "name": "AI",
            "limit": None,
        },
        {
            "path": os.path.join(raw_dir, "ai", "code_dataset_llm_style.csv"),
            "code_col": "code",
            "name": "AI",
            "limit": 1000,
        },
        {
            "path": os.path.join(raw_dir, "ai", "created_dataset_with_llms.csv"),
            "code_col": "code",
            "name": "AI",
            "limit": 1000,
        },
    ]

    # Mixed sources
    mixed_path = os.path.join(raw_dir, "human_and_ai", "HumanVsAI_CodeDataset1.csv")

    frames = []

    for src in human_sources:
        if not os.path.exists(src["path"]):
            print(f"[load_all_sources] SKIPPED (not found): {src['path']}")
            continue
        df = pd.read_csv(src["path"], low_memory=False)
        if src["code_col"] not in df.columns:
            print(f"[load_all_sources] SKIPPED (no code col): {src['path']}")
            continue
        df = df[[src["code_col"]]].rename(columns={src["code_col"]: "code"})
        df["label"] = 0
        df.dropna(subset=["code"], inplace=True)
        df = df[df["code"].astype(str).str.strip() != ""]
        if src["limit"]:
            df = df.sample(min(len(df), src["limit"]), random_state=42)
        frames.append(df[["code", "label"]])
        print(f"[load_all_sources] {len(df):>6} rows  Human  <- {src['name']}")

    for src in ai_sources:
        if not os.path.exists(src["path"]):
            print(f"[load_all_sources] SKIPPED (not found): {src['path']}")
            continue
        df = pd.read_csv(src["path"], low_memory=False)
        if src["code_col"] not in df.columns:
            print(f"[load_all_sources] SKIPPED (no code col): {src['path']}")
            continue
        df = df[[src["code_col"]]].rename(columns={src["code_col"]: "code"})
        df["label"] = 1
        df.dropna(subset=["code"], inplace=True)
        df = df[df["code"].astype(str).str.strip() != ""]
        if src["limit"]:
            df = df.sample(min(len(df), src["limit"]), random_state=42)
        frames.append(df[["code", "label"]])
        print(f"[load_all_sources] {len(df):>6} rows  AI     <- {src['name']}")

    if os.path.exists(mixed_path):
        df = pd.read_csv(mixed_path, low_memory=False, header=None, skiprows=1)
        df.columns = ["problem_id", "Sample_Code", "Generated", "Language", "Source"]
        df = df[df["Generated"].isin(["Human", "AI"])]
        df["label"] = df["Generated"].map({"Human": 0, "AI": 1})
        df = df[["Sample_Code", "label"]].rename(columns={"Sample_Code": "code"})
        df.dropna(subset=["code", "label"], inplace=True)
        df = df[df["code"].astype(str).str.strip() != ""]
        frames.append(df)
        h = int((df["label"] == 0).sum())
        a = int((df["label"] == 1).sum())
        print(f"[load_all_sources] {len(df):>6} rows  Mixed  Human={h} AI={a}  <- HumanVsAI")

    if not frames:
        raise RuntimeError("No valid data sources found.")

    combined = pd.concat(frames, ignore_index=True)
    combined["label"] = combined["label"].astype(int)
    n_h = int((combined["label"] == 0).sum())
    n_a = int((combined["label"] == 1).sum())
    print(f"\n[load_all_sources] {len(combined)} rows | Human={n_h}  AI={n_a}\n")
    return combined


def normalise(X_train, X_test, save_dir=MODELS_DIR):
    os.makedirs(save_dir, exist_ok=True)
    p1  = np.percentile(X_train, 1,  axis=0)
    p99 = np.percentile(X_train, 99, axis=0)
    X_train_c = np.clip(X_train, p1, p99)
    X_test_c  = np.clip(X_test,  p1, p99)
    mean = X_train_c.mean(axis=0)
    std  = np.where(X_train_c.std(axis=0) == 0, 1.0, X_train_c.std(axis=0))
    X_train_n = (X_train_c - mean) / std
    X_test_n  = (X_test_c  - mean) / std
    save_norm_stats(mean, std, save_dir)
    np.save(os.path.join(save_dir, "clip_p1.npy"),  p1)
    np.save(os.path.join(save_dir, "clip_p99.npy"), p99)
    print(f"[normalise] -> {save_dir}")
    return X_train_n, X_test_n, mean, std


def compute_and_save_pos_weight(y_train, save_dir=MODELS_DIR):
    n_neg = float((y_train == 0).sum())
    n_pos = float((y_train == 1).sum())
    pw    = float(np.clip(n_neg / max(n_pos, 1.0), 0.5, 4.0))
    os.makedirs(save_dir, exist_ok=True)
    with open(os.path.join(save_dir, "pos_weight.json"), "w") as f:
        json.dump({"pos_weight": pw}, f)
    print(f"[pos_weight] {pw:.3f}  (Human={int(n_neg)}  AI={int(n_pos)})")
    return pw


def load_pos_weight(save_dir=MODELS_DIR):
    path = os.path.join(save_dir, "pos_weight.json")
    if not os.path.exists(path):
        return 1.0
    with open(path) as f:
        return float(json.load(f)["pos_weight"])


def save_processed(X_train, X_test, y_train, y_test, out_dir=PROCESSED_DIR):
    os.makedirs(out_dir, exist_ok=True)
    for name, arr in [("X_train", X_train), ("X_test", X_test),
                      ("y_train", y_train), ("y_test", y_test)]:
        np.save(os.path.join(out_dir, f"{name}.npy"), arr)
    print(f"[save_processed] -> {out_dir}")


def load_processed(out_dir=PROCESSED_DIR):
    arrs = [np.load(os.path.join(out_dir, f"{n}.npy"))
            for n in ("X_train", "X_test", "y_train", "y_test")]
    print(f"[load_processed] <- {out_dir}")
    return tuple(arrs)

# run
def run_preprocessing():
    df = load_all_sources()
    y  = df["label"].to_numpy(dtype=np.float32)

    rng = np.random.default_rng(42)
    train_idx, test_idx = [], []
    for cls in np.unique(y):
        idx    = rng.permutation(np.where(y == cls)[0])
        n_test = max(1, int(len(idx) * 0.2))
        test_idx.extend(idx[:n_test].tolist())
        train_idx.extend(idx[n_test:].tolist())

    train_df = df.iloc[rng.permutation(train_idx)].reset_index(drop=True)
    test_df  = df.iloc[rng.permutation(test_idx)].reset_index(drop=True)

    y_train = train_df["label"].to_numpy(dtype=np.float32)
    y_test  = test_df["label"].to_numpy(dtype=np.float32)

    print(f"[run_preprocessing] Train: Human={int((y_train==0).sum())}  AI={int((y_train==1).sum())}")
    print(f"[run_preprocessing] Test:  Human={int((y_test==0).sum())}   AI={int((y_test==1).sum())}")
    print("\n[run_preprocessing] Extracting features ...")

    X_train = extract_feature_matrix(train_df["code"].astype(str).tolist())
    X_test  = extract_feature_matrix(test_df["code"].astype(str).tolist())
    print(f"[run_preprocessing] train={X_train.shape}  test={X_test.shape}")

    X_train, X_test, _, _ = normalise(X_train, X_test, MODELS_DIR)
    compute_and_save_pos_weight(y_train, MODELS_DIR)
    save_processed(X_train, X_test, y_train, y_test, PROCESSED_DIR)
    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    run_preprocessing()
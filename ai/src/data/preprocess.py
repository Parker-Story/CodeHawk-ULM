"""
preprocess.py
Loads raw CSVs, extracts features, normalises, and produces train/test splits.
No scikit-learn — every step is implemented with numpy / pandas only.
"""

import os
import ast
import re
import numpy as np
import pandas as pd

from src.utils.save_load import save_norm_stats

# ── Paths ────────────────────────────────────────────────────────────────────

RAW_HUMAN_DIR = os.path.join("data", "raw", "human")
RAW_AI_DIR    = os.path.join("data", "raw", "ai")
PROCESSED_DIR = os.path.join("data", "processed")
MODELS_DIR    = os.path.join("models")


# ── 1. Loading ───────────────────────────────────────────────────────────────

def load_raw_data() -> pd.DataFrame:
    """
    Load and vertically concatenate the human and AI CSV files.
    Expects:
        data/raw/human/human_selected_dataset.csv   (label == 0)
        data/raw/ai/created_dataset_with_llms.csv   (label == 1)

    Returns
    -------
    pd.DataFrame with at minimum: ['code', 'label', 'ada_embedding',
                                    'lines', 'code_lines', 'comments',
                                    'functions', 'blank_lines']
    """
    human_path = os.path.join(RAW_HUMAN_DIR, "human_selected_dataset.csv")
    ai_path    = os.path.join(RAW_AI_DIR,    "created_dataset_with_llms.csv")

    human_df = pd.read_csv(human_path)
    ai_df    = pd.read_csv(ai_path)

    df = pd.concat([human_df, ai_df], ignore_index=True)
    print(f"[load_raw_data] Loaded {len(human_df)} human + {len(ai_df)} AI rows "
          f"= {len(df)} total")
    return df


# ── 2. Ada embedding parsing ─────────────────────────────────────────────────

def parse_ada_embedding(embedding_str: str) -> np.ndarray:
    """
    Convert the stored string representation of an Ada embedding vector
    back to a numpy float32 array.

    The CSV stores embeddings as a Python-list string e.g.:
        "[0.0012, -0.034, ...]"
    """
    try:
        vec = ast.literal_eval(embedding_str)
        return np.array(vec, dtype=np.float32)
    except Exception as e:
        raise ValueError(f"[parse_ada_embedding] Could not parse embedding: {e}")


def extract_ada_embeddings(df: pd.DataFrame) -> np.ndarray:
    """
    Parse all rows in df['ada_embedding'] → 2-D array (n_samples, embed_dim).
    """
    embeddings = df["ada_embedding"].apply(parse_ada_embedding).tolist()
    return np.stack(embeddings, axis=0)          # (N, 1536)


# ── 3. Structural feature extraction from raw code ───────────────────────────

def _count_lines(code: str) -> int:
    return len(code.splitlines())


def _count_blank_lines(code: str) -> int:
    return sum(1 for ln in code.splitlines() if ln.strip() == "")


def _count_code_lines(code: str) -> int:
    """Non-empty, non-pure-comment lines."""
    count = 0
    for ln in code.splitlines():
        stripped = ln.strip()
        if stripped and not _is_comment_line(stripped):
            count += 1
    return count


def _is_comment_line(stripped: str) -> bool:
    """Heuristic: line starts with a common comment token."""
    return (
        stripped.startswith("#")
        or stripped.startswith("//")
        or stripped.startswith("*")
        or stripped.startswith("/*")
        or stripped.startswith("*/")
        or stripped.startswith("--")
    )


def _count_comment_lines(code: str) -> int:
    return sum(1 for ln in code.splitlines() if _is_comment_line(ln.strip()))


def _count_functions(code: str) -> int:
    """
    Approximate function/method count using regex patterns for the most
    common languages in competitive-programming submissions (Python, Java, C/C++).
    """
    patterns = [
        r"\bdef\s+\w+\s*\(",          # Python
        r"\b\w[\w\s\*]+\s+\w+\s*\([^)]*\)\s*\{",  # C / C++ / Java
        r"\bfunction\s+\w+\s*\(",     # JavaScript
    ]
    total = 0
    for pat in patterns:
        total += len(re.findall(pat, code))
    return total


def extract_structural_features(df: pd.DataFrame) -> np.ndarray:
    """
    Re-derive structural features from the raw code column.
    Falls back to the CSV columns if they already exist (faster).

    Returns np.ndarray shape (N, 5):
        [lines, code_lines, comments, functions, blank_lines]
    """
    structural_cols = ["lines", "code_lines", "comments", "functions", "blank_lines"]

    if all(c in df.columns for c in structural_cols):
        print("[extract_structural_features] Using pre-computed columns from CSV.")
        return df[structural_cols].to_numpy(dtype=np.float32)

    print("[extract_structural_features] Recomputing from raw code …")
    records = []
    for code in df["code"].astype(str):
        records.append([
            _count_lines(code),
            _count_code_lines(code),
            _count_comment_lines(code),
            _count_functions(code),
            _count_blank_lines(code),
        ])
    return np.array(records, dtype=np.float32)


# ── 4. Feature assembly ──────────────────────────────────────────────────────

def build_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    """
    Concatenate Ada embeddings (1536-d) with structural features (5-d).

    Returns np.ndarray shape (N, 1541)
    """
    embeddings  = extract_ada_embeddings(df)        # (N, 1536)
    structural  = extract_structural_features(df)   # (N, 5)
    X = np.concatenate([embeddings, structural], axis=1)
    print(f"[build_feature_matrix] Feature matrix shape: {X.shape}")
    return X


# ── 5. Z-score normalisation ─────────────────────────────────────────────────

def normalise(X_train: np.ndarray,
              X_test:  np.ndarray,
              save_dir: str = MODELS_DIR
              ) -> tuple:
    """
    Fit z-score normalisation on X_train, apply to both splits.
    Saves mean and std so inference can replicate the same transform.

    Returns
    -------
    (X_train_norm, X_test_norm, mean, std)
    """
    mean = X_train.mean(axis=0)
    std  = X_train.std(axis=0)
    std  = np.where(std == 0, 1.0, std)   # avoid division by zero

    X_train_norm = (X_train - mean) / std
    X_test_norm  = (X_test  - mean) / std

    save_norm_stats(mean, std, save_dir)
    return X_train_norm, X_test_norm, mean, std


# ── 6. Stratified train/test split ───────────────────────────────────────────

def stratified_split(X: np.ndarray,
                     y: np.ndarray,
                     test_size: float = 0.2,
                     seed: int = 42
                     ) -> tuple:
    """
    Manual stratified split that preserves the class ratio in both partitions.

    Returns
    -------
    (X_train, X_test, y_train, y_test)
    """
    rng     = np.random.default_rng(seed)
    classes = np.unique(y)

    train_idx, test_idx = [], []

    for cls in classes:
        idx      = np.where(y == cls)[0]
        idx      = rng.permutation(idx)
        n_test   = max(1, int(len(idx) * test_size))
        test_idx.extend(idx[:n_test].tolist())
        train_idx.extend(idx[n_test:].tolist())

    train_idx = np.array(train_idx)
    test_idx  = np.array(test_idx)

    # Final shuffle within each split
    train_idx = rng.permutation(train_idx)
    test_idx  = rng.permutation(test_idx)

    print(f"[stratified_split] Train={len(train_idx)}  Test={len(test_idx)}")
    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]


# ── 7. Save / load processed arrays ─────────────────────────────────────────

def save_processed(X_train, X_test, y_train, y_test,
                   out_dir: str = PROCESSED_DIR) -> None:
    os.makedirs(out_dir, exist_ok=True)
    np.save(os.path.join(out_dir, "X_train.npy"), X_train)
    np.save(os.path.join(out_dir, "X_test.npy"),  X_test)
    np.save(os.path.join(out_dir, "y_train.npy"), y_train)
    np.save(os.path.join(out_dir, "y_test.npy"),  y_test)
    print(f"[save_processed] Arrays saved → {out_dir}")


def load_processed(out_dir: str = PROCESSED_DIR) -> tuple:
    X_train = np.load(os.path.join(out_dir, "X_train.npy"))
    X_test  = np.load(os.path.join(out_dir, "X_test.npy"))
    y_train = np.load(os.path.join(out_dir, "y_train.npy"))
    y_test  = np.load(os.path.join(out_dir, "y_test.npy"))
    print(f"[load_processed] Loaded processed arrays from {out_dir}")
    return X_train, X_test, y_train, y_test


# ── 8. Top-level pipeline entry point ───────────────────────────────────────

def run_preprocessing() -> tuple:
    """
    Full pipeline:
        load → features → split → normalise → save
    Call this from train.py or a notebook.
    """
    df = load_raw_data()
    X  = build_feature_matrix(df)
    y  = df["label"].to_numpy(dtype=np.float32)

    X_train, X_test, y_train, y_test = stratified_split(X, y)
    X_train, X_test, _, _            = normalise(X_train, X_test)

    save_processed(X_train, X_test, y_train, y_test)
    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    run_preprocessing()
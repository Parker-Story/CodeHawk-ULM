"""
preprocess.py
Loads the final merged CSV, builds a from-scratch TF-IDF embedder on the
code column, extracts structural features, normalises, stratified-splits,
and saves everything ready for training.

Option B approach: Ada embeddings in the CSV are IGNORED.
We build our own token embeddings from the raw code text so the same
transform can be applied to brand-new submissions at inference time.
"""

import os
import re
import math
import numpy as np
import pandas as pd

from src.utils.save_load import save_norm_stats, save_vocab

# ── Paths ─────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

FINAL_CSV     = os.path.join(BASE_DIR, "data", "processed",
                "all_data_with_ada_embeddings_will_be_splitted_into_train_test_set.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR    = os.path.join(BASE_DIR, "models")

# TF-IDF vocabulary size (top-N tokens by document frequency)
VOCAB_SIZE = 5000


# ══════════════════════════════════════════════════════════════════════════════
#  1. Data loading
# ══════════════════════════════════════════════════════════════════════════════

def load_final_csv() -> pd.DataFrame:
    """
    Load the merged dataset.
    Keeps only the columns we actually need: code + label.
    Structural feature columns are recomputed from raw code for consistency.
    """
    if not os.path.exists(FINAL_CSV):
        raise FileNotFoundError(
            f"[load_final_csv] Expected file not found:\n  {FINAL_CSV}\n"
            "Place the merged CSV in data/processed/ before running."
        )
    df = pd.read_csv(FINAL_CSV)
    print(f"[load_final_csv] Loaded {len(df)} rows  "
          f"| AI={int(df['label'].sum())}  "
          f"Human={int((df['label']==0).sum())}")
    return df


# ══════════════════════════════════════════════════════════════════════════════
#  2. Code tokeniser
# ══════════════════════════════════════════════════════════════════════════════

def tokenise(code: str) -> list:
    """
    Split source code into tokens suitable for TF-IDF.
    Keeps identifiers, keywords, numbers, and common operators.
    Lowercases everything and drops pure-whitespace tokens.
    """
    # Split on whitespace and common delimiters while keeping meaningful tokens
    tokens = re.findall(r"[a-zA-Z_]\w*|[0-9]+(?:\.[0-9]+)?|[+\-*/=<>!&|^~%]+|[{}()\[\];:,.]", code)
    return [t.lower() for t in tokens if t.strip()]


# ══════════════════════════════════════════════════════════════════════════════
#  3. TF-IDF — built entirely from scratch
# ══════════════════════════════════════════════════════════════════════════════

def build_vocabulary(tokenised_docs: list, vocab_size: int = VOCAB_SIZE) -> dict:
    """
    Build a token→index vocabulary from the training corpus.
    Selects the top `vocab_size` tokens by document frequency (how many
    documents contain the token), which is more robust than raw count.

    Parameters
    ----------
    tokenised_docs : list of token lists  (training set only)
    vocab_size     : maximum vocabulary size

    Returns
    -------
    vocab : {token: index}  (index 0 … vocab_size-1)
    """
    doc_freq = {}
    for tokens in tokenised_docs:
        for tok in set(tokens):          # count each token once per doc
            doc_freq[tok] = doc_freq.get(tok, 0) + 1

    # Sort by descending document frequency, take top vocab_size
    sorted_tokens = sorted(doc_freq.items(), key=lambda x: -x[1])[:vocab_size]
    vocab = {tok: idx for idx, (tok, _) in enumerate(sorted_tokens)}
    print(f"[build_vocabulary] Vocabulary size: {len(vocab)}")
    return vocab


def compute_idf(tokenised_docs: list, vocab: dict) -> np.ndarray:
    """
    Compute IDF weights for every token in the vocabulary.

    IDF(t) = log( (N + 1) / (df(t) + 1) ) + 1    (smoothed)

    Parameters
    ----------
    tokenised_docs : list of token lists  (training set only)
    vocab          : {token: index}

    Returns
    -------
    idf : np.ndarray shape (vocab_size,)
    """
    N       = len(tokenised_docs)
    df      = np.zeros(len(vocab), dtype=np.float32)

    for tokens in tokenised_docs:
        for tok in set(tokens):
            if tok in vocab:
                df[vocab[tok]] += 1

    idf = np.log((N + 1) / (df + 1)) + 1.0
    return idf.astype(np.float32)


def tfidf_vectorise(tokens: list,
                    vocab: dict,
                    idf: np.ndarray) -> np.ndarray:
    """
    Convert a single document's token list to a TF-IDF vector.

    TF(t, d)     = count(t in d) / len(d)
    TF-IDF(t, d) = TF(t, d) * IDF(t)
    Then L2-normalised so vector magnitude = 1.

    Parameters
    ----------
    tokens : list of str
    vocab  : {token: index}
    idf    : np.ndarray shape (vocab_size,)

    Returns
    -------
    np.ndarray shape (vocab_size,)
    """
    vec = np.zeros(len(vocab), dtype=np.float32)
    if not tokens:
        return vec

    # Term frequency
    for tok in tokens:
        if tok in vocab:
            vec[vocab[tok]] += 1
    vec /= len(tokens)

    # Multiply by IDF
    vec *= idf

    # L2 normalise
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm

    return vec


def vectorise_corpus(tokenised_docs: list,
                     vocab: dict,
                     idf: np.ndarray) -> np.ndarray:
    """Vectorise a list of token lists → (N, vocab_size) matrix."""
    return np.stack(
        [tfidf_vectorise(doc, vocab, idf) for doc in tokenised_docs],
        axis=0
    )


# ══════════════════════════════════════════════════════════════════════════════
#  4. Structural features  (recomputed from raw code)
# ══════════════════════════════════════════════════════════════════════════════

def _is_comment(line: str) -> bool:
    s = line.strip()
    return s.startswith(("#", "//", "*", "/*", "*/", "--"))


def _structural(code: str) -> list:
    lines   = code.splitlines()
    total   = len(lines)
    blank   = sum(1 for ln in lines if ln.strip() == "")
    comment = sum(1 for ln in lines if _is_comment(ln))
    code_ln = sum(1 for ln in lines if ln.strip() and not _is_comment(ln))
    funcs   = sum(len(re.findall(p, code)) for p in [
        r"\bdef\s+\w+\s*\(",
        r"\b\w[\w\s\*]+\s+\w+\s*\([^)]*\)\s*\{",
        r"\bfunction\s+\w+\s*\(",
    ])
    return [total, code_ln, comment, funcs, blank]


def extract_structural_matrix(codes: list) -> np.ndarray:
    """Return (N, 5) float32 matrix of structural features."""
    return np.array([_structural(c) for c in codes], dtype=np.float32)


# ══════════════════════════════════════════════════════════════════════════════
#  5. Normalisation
# ══════════════════════════════════════════════════════════════════════════════

def normalise(X_train: np.ndarray,
              X_test:  np.ndarray,
              save_dir: str = MODELS_DIR) -> tuple:
    """
    Fit z-score on X_train, apply to both splits.
    Saves mean/std so inference can replicate the exact same transform.
    """
    mean = X_train.mean(axis=0)
    std  = X_train.std(axis=0)
    std  = np.where(std == 0, 1.0, std)

    X_train_n = (X_train - mean) / std
    X_test_n  = (X_test  - mean) / std

    save_norm_stats(mean, std, save_dir)
    return X_train_n, X_test_n, mean, std


# ══════════════════════════════════════════════════════════════════════════════
#  6. Stratified train/test split  (from scratch)
# ══════════════════════════════════════════════════════════════════════════════

def stratified_split(X: np.ndarray,
                     y: np.ndarray,
                     test_size: float = 0.2,
                     seed: int = 42) -> tuple:
    """Manual stratified split that preserves the class ratio."""
    rng   = np.random.default_rng(seed)
    train_idx, test_idx = [], []

    for cls in np.unique(y):
        idx    = np.where(y == cls)[0]
        idx    = rng.permutation(idx)
        n_test = max(1, int(len(idx) * test_size))
        test_idx.extend(idx[:n_test].tolist())
        train_idx.extend(idx[n_test:].tolist())

    train_idx = rng.permutation(np.array(train_idx))
    test_idx  = rng.permutation(np.array(test_idx))

    print(f"[stratified_split] train={len(train_idx)}  test={len(test_idx)}")
    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]


# ══════════════════════════════════════════════════════════════════════════════
#  7. Save / load processed arrays
# ══════════════════════════════════════════════════════════════════════════════

def save_processed(X_train, X_test, y_train, y_test,
                   out_dir: str = PROCESSED_DIR) -> None:
    os.makedirs(out_dir, exist_ok=True)
    np.save(os.path.join(out_dir, "X_train.npy"), X_train)
    np.save(os.path.join(out_dir, "X_test.npy"),  X_test)
    np.save(os.path.join(out_dir, "y_train.npy"), y_train)
    np.save(os.path.join(out_dir, "y_test.npy"),  y_test)
    print(f"[save_processed] Saved arrays → {out_dir}")


def load_processed(out_dir: str = PROCESSED_DIR) -> tuple:
    X_train = np.load(os.path.join(out_dir, "X_train.npy"))
    X_test  = np.load(os.path.join(out_dir, "X_test.npy"))
    y_train = np.load(os.path.join(out_dir, "y_train.npy"))
    y_test  = np.load(os.path.join(out_dir, "y_test.npy"))
    print(f"[load_processed] Loaded arrays ← {out_dir}")
    return X_train, X_test, y_train, y_test


# ══════════════════════════════════════════════════════════════════════════════
#  8. Full pipeline entry point
# ══════════════════════════════════════════════════════════════════════════════

def run_preprocessing(vocab_size: int = VOCAB_SIZE) -> tuple:
    """
    Full pipeline:
      load CSV → tokenise → build vocab/IDF (train only) → TF-IDF vectors
      → structural features → concatenate → split → normalise → save

    Returns
    -------
    (X_train, X_test, y_train, y_test)
    """
    # 1. Load
    df    = load_final_csv()
    codes = df["code"].astype(str).tolist()
    y     = df["label"].to_numpy(dtype=np.float32)

    # 2. Tokenise all documents
    print("[run_preprocessing] Tokenising code …")
    tokenised = [tokenise(c) for c in codes]

    # 3. Initial split (we build vocab on TRAINING data only to avoid leakage)
    #    We split indices first, then build vocab from train subset
    n          = len(y)
    rng        = np.random.default_rng(42)
    all_idx    = rng.permutation(n)
    n_test     = int(n * 0.2)
    test_idx   = all_idx[:n_test]
    train_idx  = all_idx[n_test:]

    train_tokenised = [tokenised[i] for i in train_idx]
    train_codes     = [codes[i]     for i in train_idx]
    test_codes      = [codes[i]     for i in test_idx]

    # 4. Build vocab + IDF on training set only
    print("[run_preprocessing] Building vocabulary …")
    vocab = build_vocabulary(train_tokenised, vocab_size)
    idf   = compute_idf(train_tokenised, vocab)
    save_vocab(vocab, idf, MODELS_DIR)

    # 5. TF-IDF vectorise both splits
    print("[run_preprocessing] Vectorising corpus …")
    X_train_tfidf = vectorise_corpus(train_tokenised, vocab, idf)
    X_test_tfidf  = vectorise_corpus([tokenise(c) for c in test_codes], vocab, idf)

    # 6. Structural features
    print("[run_preprocessing] Extracting structural features …")
    X_train_struct = extract_structural_matrix(train_codes)
    X_test_struct  = extract_structural_matrix(test_codes)

    # 7. Concatenate  →  (N, vocab_size + 5)
    X_train = np.concatenate([X_train_tfidf, X_train_struct], axis=1)
    X_test  = np.concatenate([X_test_tfidf,  X_test_struct],  axis=1)
    y_train = y[train_idx]
    y_test  = y[test_idx]

    print(f"[run_preprocessing] Feature matrix shape: train={X_train.shape}  test={X_test.shape}")

    # 8. Normalise
    X_train, X_test, _, _ = normalise(X_train, X_test, MODELS_DIR)

    # 9. Save
    save_processed(X_train, X_test, y_train, y_test, PROCESSED_DIR)

    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    run_preprocessing()
"""
save_load.py
All file I/O for model weights, normalisation stats, TF-IDF vocab, and
training history.  Pure numpy + json — no ML libraries.
"""

import os
import json
import numpy as np


def _ensure(path: str) -> None:
    os.makedirs(path, exist_ok=True)


# ── Weights ──────────────────────────────────────────────────────────────────

def save_weights(weights: dict, save_dir: str) -> None:
    """Save each weight/bias array as a separate .npy file."""
    _ensure(save_dir)
    for name, arr in weights.items():
        p = os.path.join(save_dir, f"{name}.npy")
        np.save(p, arr)
        print(f"[save_weights] {name} → {p}  shape={arr.shape}")


def load_weights(save_dir: str, keys: list) -> dict:
    """Load weight arrays by key name from .npy files."""
    weights = {}
    for name in keys:
        p = os.path.join(save_dir, f"{name}.npy")
        if not os.path.exists(p):
            raise FileNotFoundError(f"[load_weights] Missing: {p}")
        weights[name] = np.load(p)
        print(f"[load_weights] {name} ← {p}  shape={weights[name].shape}")
    return weights


# ── Normalisation stats ───────────────────────────────────────────────────────

def save_norm_stats(mean: np.ndarray, std: np.ndarray, save_dir: str) -> None:
    _ensure(save_dir)
    np.save(os.path.join(save_dir, "norm_mean.npy"), mean)
    np.save(os.path.join(save_dir, "norm_std.npy"),  std)
    print(f"[save_norm_stats] norm_mean + norm_std → {save_dir}")


def load_norm_stats(save_dir: str) -> tuple:
    mean = np.load(os.path.join(save_dir, "norm_mean.npy"))
    std  = np.load(os.path.join(save_dir, "norm_std.npy"))
    print(f"[load_norm_stats] Loaded from {save_dir}")
    return mean, std


# ── TF-IDF vocabulary ─────────────────────────────────────────────────────────

def save_vocab(vocab: dict, idf: np.ndarray, save_dir: str) -> None:
    """
    Save token→index vocab dict and IDF weight vector.

    Parameters
    ----------
    vocab    : {token: int}
    idf      : np.ndarray shape (vocab_size,)
    save_dir : destination directory
    """
    _ensure(save_dir)
    vocab_path = os.path.join(save_dir, "vocab.json")
    idf_path   = os.path.join(save_dir, "idf.npy")
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocab, f)
    np.save(idf_path, idf)
    print(f"[save_vocab] {len(vocab)} tokens → {vocab_path}")
    print(f"[save_vocab] idf → {idf_path}")


def load_vocab(save_dir: str) -> tuple:
    """Load vocab dict and IDF array. Returns (vocab, idf)."""
    vocab_path = os.path.join(save_dir, "vocab.json")
    idf_path   = os.path.join(save_dir, "idf.npy")
    for p in (vocab_path, idf_path):
        if not os.path.exists(p):
            raise FileNotFoundError(f"[load_vocab] Missing: {p}")
    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab = json.load(f)
    idf = np.load(idf_path)
    print(f"[load_vocab] {len(vocab)} tokens ← {save_dir}")
    return vocab, idf


# ── Training history ──────────────────────────────────────────────────────────

def save_training_history(history: dict, save_dir: str) -> None:
    _ensure(save_dir)
    path = os.path.join(save_dir, "training_history.json")
    out  = {k: [float(v) for v in vals] for k, vals in history.items()}
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"[save_training_history] → {path}")


def load_training_history(save_dir: str) -> dict:
    path = os.path.join(save_dir, "training_history.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"[load_training_history] Missing: {path}")
    with open(path) as f:
        return json.load(f)
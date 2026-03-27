"""
save_load.py
Handles saving and loading of model weights, biases, and normalization statistics.
No external ML libraries — pure numpy file I/O.
"""

import numpy as np
import os
import json


# ── Directory helpers ────────────────────────────────────────────────────────

def ensure_dir(path: str) -> None:
    """Create directory if it does not exist."""
    os.makedirs(path, exist_ok=True)


# ── Model weights ────────────────────────────────────────────────────────────

def save_weights(weights: dict, save_dir: str) -> None:
    """
    Save model weight/bias arrays to disk.

    Parameters
    ----------
    weights : dict
        Keys are parameter names (e.g. 'W1', 'b1', 'W2', 'b2').
        Values are numpy arrays.
    save_dir : str
        Directory where .npy files will be written.

    Example
    -------
    save_weights({'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2}, 'models/')
    """
    ensure_dir(save_dir)
    for name, array in weights.items():
        file_path = os.path.join(save_dir, f"{name}.npy")
        np.save(file_path, array)
        print(f"[save_weights] Saved {name} → {file_path}  shape={array.shape}")


def load_weights(save_dir: str, keys: list) -> dict:
    """
    Load model weight/bias arrays from disk.

    Parameters
    ----------
    save_dir : str
        Directory containing .npy files.
    keys : list of str
        Parameter names to load (e.g. ['W1', 'b1', 'W2', 'b2']).

    Returns
    -------
    dict  {name: numpy array}
    """
    weights = {}
    for name in keys:
        file_path = os.path.join(save_dir, f"{name}.npy")
        if not os.path.exists(file_path):
            raise FileNotFoundError(
                f"[load_weights] Expected weight file not found: {file_path}"
            )
        weights[name] = np.load(file_path)
        print(f"[load_weights] Loaded {name} ← {file_path}  shape={weights[name].shape}")
    return weights


# ── Normalization statistics ─────────────────────────────────────────────────

def save_norm_stats(mean: np.ndarray, std: np.ndarray, save_dir: str) -> None:
    """
    Save z-score normalization statistics (mean and std) computed on the
    training set.  These must be reused at inference time so that unseen
    samples are scaled identically.

    Parameters
    ----------
    mean : np.ndarray  shape (n_features,)
    std  : np.ndarray  shape (n_features,)
    save_dir : str
    """
    ensure_dir(save_dir)
    np.save(os.path.join(save_dir, "norm_mean.npy"), mean)
    np.save(os.path.join(save_dir, "norm_std.npy"), std)
    print(f"[save_norm_stats] Saved norm_mean and norm_std → {save_dir}")


def load_norm_stats(save_dir: str) -> tuple:
    """
    Load z-score normalization statistics.

    Returns
    -------
    (mean, std)  both np.ndarray shape (n_features,)
    """
    mean_path = os.path.join(save_dir, "norm_mean.npy")
    std_path  = os.path.join(save_dir, "norm_std.npy")

    for p in (mean_path, std_path):
        if not os.path.exists(p):
            raise FileNotFoundError(f"[load_norm_stats] Missing file: {p}")

    mean = np.load(mean_path)
    std  = np.load(std_path)
    print(f"[load_norm_stats] Loaded norm stats ← {save_dir}")
    return mean, std


# ── Training history ─────────────────────────────────────────────────────────

def save_training_history(history: dict, save_dir: str) -> None:
    """
    Persist training loss/accuracy history as JSON so it can be plotted later.

    Parameters
    ----------
    history : dict
        e.g. {'loss': [0.9, 0.7, ...], 'accuracy': [0.5, 0.6, ...]}
    save_dir : str
    """
    ensure_dir(save_dir)
    path = os.path.join(save_dir, "training_history.json")
    # Convert numpy floats → Python floats for JSON serialisation
    serialisable = {k: [float(v) for v in vals] for k, vals in history.items()}
    with open(path, "w") as f:
        json.dump(serialisable, f, indent=2)
    print(f"[save_training_history] Saved training history → {path}")


def load_training_history(save_dir: str) -> dict:
    """Load training history JSON."""
    path = os.path.join(save_dir, "training_history.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"[load_training_history] Not found: {path}")
    with open(path) as f:
        return json.load(f)
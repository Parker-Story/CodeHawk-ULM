"""
save_load.py — all file I/O.  Pure numpy + json.
Note: vocab/IDF functions kept for backwards compatibility
but are no longer used since TF-IDF was removed.
"""

import os, json
import numpy as np


def _ensure(p): os.makedirs(p, exist_ok=True)


def save_weights(weights, save_dir):
    _ensure(save_dir)
    for name, arr in weights.items():
        p = os.path.join(save_dir, f"{name}.npy")
        np.save(p, arr)
        print(f"[save_weights] {name} -> {p}  shape={arr.shape}")


def load_weights(save_dir, keys):
    w = {}
    for name in keys:
        p = os.path.join(save_dir, f"{name}.npy")
        if not os.path.exists(p):
            raise FileNotFoundError(f"[load_weights] Missing: {p}")
        w[name] = np.load(p)
        print(f"[load_weights] {name} <- {p}  shape={w[name].shape}")
    return w


def save_norm_stats(mean, std, save_dir):
    _ensure(save_dir)
    np.save(os.path.join(save_dir, "norm_mean.npy"), mean)
    np.save(os.path.join(save_dir, "norm_std.npy"),  std)
    print(f"[save_norm_stats] -> {save_dir}")


def load_norm_stats(save_dir):
    mean = np.load(os.path.join(save_dir, "norm_mean.npy"))
    std  = np.load(os.path.join(save_dir, "norm_std.npy"))
    print(f"[load_norm_stats] <- {save_dir}")
    return mean, std


def save_vocab(vocab, idf, save_dir):
    _ensure(save_dir)
    with open(os.path.join(save_dir, "vocab.json"), "w") as f:
        json.dump(vocab, f)
    np.save(os.path.join(save_dir, "idf.npy"), idf)


def load_vocab(save_dir):
    with open(os.path.join(save_dir, "vocab.json")) as f:
        vocab = json.load(f)
    idf = np.load(os.path.join(save_dir, "idf.npy"))
    return vocab, idf


def save_training_history(history, save_dir):
    _ensure(save_dir)
    path = os.path.join(save_dir, "training_history.json")
    out  = {k: [float(v) for v in vals] for k, vals in history.items()}
    with open(path, "w") as f: json.dump(out, f, indent=2)
    print(f"[save_training_history] -> {path}")


def load_training_history(save_dir):
    path = os.path.join(save_dir, "training_history.json")
    with open(path) as f: return json.load(f)
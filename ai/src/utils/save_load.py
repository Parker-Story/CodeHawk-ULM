"""
save_load.py
"""

import os
import json
import numpy as np


def _ensure(path: str) -> None:
    os.makedirs(path, exist_ok=True)


# Model weights

def save_weights(weights: dict, save_dir: str) -> None:
    _ensure(save_dir)
    for name, arr in weights.items():
        p = os.path.join(save_dir, f"{name}.npy")
        np.save(p, arr)
        print(f"[save_weights] {name} -> {p}  shape={arr.shape}")


def load_weights(save_dir: str, keys: list) -> dict:
    w = {}
    for name in keys:
        p = os.path.join(save_dir, f"{name}.npy")
        if not os.path.exists(p):
            raise FileNotFoundError(f"[load_weights] Missing: {p}")
        w[name] = np.load(p)
        print(f"[load_weights] {name} <- shape={w[name].shape}")
    return w


# Normalisation stats

def save_norm_stats(mean: np.ndarray, std: np.ndarray, save_dir: str) -> None:
    _ensure(save_dir)
    np.save(os.path.join(save_dir, "norm_mean.npy"), mean)
    np.save(os.path.join(save_dir, "norm_std.npy"),  std)
    print(f"[save_norm_stats] -> {save_dir}")


def load_norm_stats(save_dir: str) -> tuple:
    mean = np.load(os.path.join(save_dir, "norm_mean.npy"))
    std  = np.load(os.path.join(save_dir, "norm_std.npy"))
    print(f"[load_norm_stats] <- {save_dir}")
    return mean, std


# Training history

def save_training_history(history: dict, save_dir: str) -> None:
    _ensure(save_dir)
    path = os.path.join(save_dir, "training_history.json")
    with open(path, "w") as f:
        json.dump({k: [float(v) for v in vals] for k, vals in history.items()},
                  f, indent=2)
    print(f"[save_training_history] -> {path}")


def load_training_history(save_dir: str) -> dict:
    path = os.path.join(save_dir, "training_history.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"[load_training_history] Missing: {path}")
    with open(path) as f:
        return json.load(f)
"""
train.py — tuned for 40 dense hand-crafted features.
Smaller batches and more epochs work better on dense low-dim features.
"""

import os
import numpy as np

from src.data.preprocess       import run_preprocessing, load_processed
from src.models.neural_network import NeuralNetwork, binary_cross_entropy
from src.utils.save_load       import save_weights, save_training_history

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODELS_DIR    = os.path.join(BASE_DIR, "models")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
WEIGHT_KEYS   = ["W1", "b1", "W2", "b2", "W3", "b3"]


def _batch_generator(X, y, batch_size, rng):
    idx = rng.permutation(len(X))
    for start in range(0, len(X), batch_size):
        b = idx[start:start + batch_size]
        yield X[b], y[b]


def _accuracy(y_true, y_proba, threshold=0.5):
    return float(np.mean((y_proba >= threshold).astype(int) == y_true.astype(int)))


def train(epochs:       int   = 200,
          batch_size:   int   = 32,      # smaller batches for 40-dim dense features
          lr:           float = 5e-4,
          dropout_rate: float = 0.3,
          hidden1:      int   = 64,
          hidden2:      int   = 32,
          patience:     int   = 25,
          l2_lambda:    float = 1e-4,
          seed:         int   = 42,
          reprocess:    bool  = False) -> NeuralNetwork:

    cached = all(
        os.path.exists(os.path.join(PROCESSED_DIR, f))
        for f in ["X_train.npy", "X_test.npy", "y_train.npy", "y_test.npy"]
    )

    if reprocess or not cached:
        print("[train] Running preprocessing ...")
        X_train, X_test, y_train, y_test = run_preprocessing()
    else:
        print("[train] Loading cached arrays ...")
        X_train, X_test, y_train, y_test = load_processed(PROCESSED_DIR)

    input_dim = X_train.shape[1]
    print(f"[train] input_dim={input_dim}  train={len(X_train)}  test={len(X_test)}")
    print(f"[train] Train: Human={int((y_train==0).sum())}  AI={int((y_train==1).sum())}")
    print(f"[train] Test:  Human={int((y_test==0).sum())}   AI={int((y_test==1).sum())}\n")

    model = NeuralNetwork(
        input_dim=input_dim, hidden1=hidden1, hidden2=hidden2,
        lr=lr, dropout_rate=dropout_rate, l2_lambda=l2_lambda, seed=seed,
    )

    rng     = np.random.default_rng(seed)
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    best_val_loss    = float("inf")
    best_weights     = None
    patience_counter = 0

    for epoch in range(1, epochs + 1):
        batch_losses = []
        for X_b, y_b in _batch_generator(X_train, y_train, batch_size, rng):
            y_hat = model.forward(X_b, training=True)
            loss  = binary_cross_entropy(y_b, y_hat)
            model.backward(y_b)
            batch_losses.append(loss)

        train_loss = float(np.mean(batch_losses))
        train_acc  = _accuracy(y_train, model.predict_proba(X_train))
        val_proba  = model.predict_proba(X_test)
        val_loss   = float(binary_cross_entropy(y_test, val_proba))
        val_acc    = _accuracy(y_test, val_proba)

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        if epoch % 20 == 0 or epoch == 1:
            print(f"  Epoch {epoch:>4}/{epochs} | "
                  f"train_loss={train_loss:.4f}  train_acc={train_acc:.4f} | "
                  f"val_loss={val_loss:.4f}  val_acc={val_acc:.4f}")

        if val_loss < best_val_loss:
            best_val_loss    = val_loss
            best_weights     = {k: v.copy() for k, v in model.get_weights().items()}
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"\n[train] Early stopping at epoch {epoch}  "
                      f"best_val_loss={best_val_loss:.4f}")
                break

    if best_weights:
        model.set_weights(best_weights)
        print("[train] Best weights restored.")

    os.makedirs(MODELS_DIR, exist_ok=True)
    save_weights(model.get_weights(), MODELS_DIR)
    save_training_history(history, MODELS_DIR)
    print(f"\n[train] Saved -> {MODELS_DIR}")
    return model


if __name__ == "__main__":
    train()
"""
train.py
Trains the NeuralNetwork model using mini-batch gradient descent.
Loads processed data, trains, applies early stopping, saves weights.
"""

import os
import numpy as np

from src.data.preprocess     import run_preprocessing, load_processed
from src.models.neural_network import NeuralNetwork, binary_cross_entropy
from src.utils.save_load       import save_weights, save_training_history

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODELS_DIR    = os.path.join(BASE_DIR, "models")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
WEIGHT_KEYS   = ["W1", "b1", "W2", "b2", "W3", "b3"]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _batch_generator(X: np.ndarray, y: np.ndarray,
                     batch_size: int, rng: np.random.Generator):
    """Yield shuffled (X_batch, y_batch) pairs."""
    idx = rng.permutation(len(X))
    for start in range(0, len(X), batch_size):
        b = idx[start:start + batch_size]
        yield X[b], y[b]


def _accuracy(y_true: np.ndarray, y_proba: np.ndarray,
              threshold: float = 0.5) -> float:
    return float(np.mean((y_proba >= threshold).astype(int) == y_true.astype(int)))


# ── Training ──────────────────────────────────────────────────────────────────

def train(epochs:        int   = 100,
          batch_size:    int   = 64,
          lr:            float = 1e-3,
          dropout_rate:  float = 0.3,
          hidden1:       int   = 256,
          hidden2:       int   = 64,
          patience:      int   = 10,
          seed:          int   = 42,
          reprocess:     bool  = False) -> NeuralNetwork:
    """
    Full training run.

    Parameters
    ----------
    epochs       : maximum training epochs
    batch_size   : samples per gradient update
    lr           : learning rate
    dropout_rate : dropout fraction on hidden layer 1
    hidden1/2    : layer sizes
    patience     : early-stopping patience (epochs without val_loss improvement)
    seed         : reproducibility seed
    reprocess    : force re-run of preprocessing even if cached files exist

    Returns
    -------
    Trained NeuralNetwork instance (best weights restored)
    """

    # ── Load data ─────────────────────────────────────────────────────────────
    cached = all(
        os.path.exists(os.path.join(PROCESSED_DIR, f))
        for f in ["X_train.npy", "X_test.npy", "y_train.npy", "y_test.npy"]
    )

    if reprocess or not cached:
        print("[train] Running full preprocessing pipeline …")
        X_train, X_test, y_train, y_test = run_preprocessing()
    else:
        print("[train] Loading cached processed arrays …")
        X_train, X_test, y_train, y_test = load_processed(PROCESSED_DIR)

    input_dim = X_train.shape[1]
    print(f"[train] input_dim={input_dim}  "
          f"train_samples={len(X_train)}  test_samples={len(X_test)}")

    # ── Initialise model ──────────────────────────────────────────────────────
    model = NeuralNetwork(
        input_dim    = input_dim,
        hidden1      = hidden1,
        hidden2      = hidden2,
        lr           = lr,
        dropout_rate = dropout_rate,
        seed         = seed,
    )

    rng     = np.random.default_rng(seed)
    history = {"train_loss": [], "train_acc": [],
               "val_loss":   [], "val_acc":   []}

    best_val_loss    = float("inf")
    best_weights     = None
    patience_counter = 0

    # ── Epoch loop ────────────────────────────────────────────────────────────
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
        val_loss   = binary_cross_entropy(y_test, val_proba)
        val_acc    = _accuracy(y_test, val_proba)

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:>4}/{epochs} │ "
                  f"train_loss={train_loss:.4f}  train_acc={train_acc:.4f} │ "
                  f"val_loss={val_loss:.4f}  val_acc={val_acc:.4f}")

        # ── Early stopping ────────────────────────────────────────────────────
        if val_loss < best_val_loss:
            best_val_loss    = val_loss
            best_weights     = {k: v.copy() for k, v in model.get_weights().items()}
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"\n[train] Early stopping at epoch {epoch}  "
                      f"(best val_loss={best_val_loss:.4f})")
                break

    # ── Restore best weights and save ─────────────────────────────────────────
    if best_weights:
        model.set_weights(best_weights)
        print("[train] Best weights restored.")

    os.makedirs(MODELS_DIR, exist_ok=True)
    save_weights(model.get_weights(), MODELS_DIR)
    save_training_history(history, MODELS_DIR)
    print(f"\n[train] Model saved → {MODELS_DIR}")

    return model


if __name__ == "__main__":
    train(epochs=100, batch_size=64, lr=1e-3)
"""
train.py
Training loop for the NeuralNet model.
Loads processed data, trains with mini-batch gradient descent, saves weights.
"""

import numpy as np
import os

from src.data.preprocess    import run_preprocessing, load_processed
from src.models.logistic_regression_model import NeuralNet, binary_cross_entropy
from src.utils.save_load    import save_weights, save_training_history

MODELS_DIR    = os.path.join("models")
PROCESSED_DIR = os.path.join("data", "processed")


# ── Mini-batch generator ─────────────────────────────────────────────────────

def batch_generator(X: np.ndarray,
                    y: np.ndarray,
                    batch_size: int,
                    rng: np.random.Generator):
    """Yield (X_batch, y_batch) tuples after shuffling each epoch."""
    idx = rng.permutation(len(X))
    for start in range(0, len(X), batch_size):
        end  = start + batch_size
        b    = idx[start:end]
        yield X[b], y[b]


# ── Accuracy helper ──────────────────────────────────────────────────────────

def accuracy(y_true: np.ndarray, y_pred_proba: np.ndarray,
             threshold: float = 0.5) -> float:
    preds = (y_pred_proba >= threshold).astype(int)
    return float(np.mean(preds == y_true))


# ── Training ─────────────────────────────────────────────────────────────────

def train(epochs:      int   = 50,
          batch_size:  int   = 64,
          lr:          float = 1e-3,
          dropout_rate:float = 0.3,
          hidden1:     int   = 256,
          hidden2:     int   = 64,
          seed:        int   = 42,
          reprocess:   bool  = False) -> NeuralNet:
    """
    Full training run.

    Parameters
    ----------
    epochs       : number of full passes over training data
    batch_size   : samples per gradient update
    lr           : learning rate
    dropout_rate : fraction of hidden-1 neurons dropped during training
    hidden1/2    : layer sizes
    seed         : reproducibility seed
    reprocess    : if True, re-run preprocessing even if processed files exist

    Returns
    -------
    Trained NeuralNet instance
    """

    # ── Load data ────────────────────────────────────────────────────────────
    processed_exists = all(
        os.path.exists(os.path.join(PROCESSED_DIR, f))
        for f in ["X_train.npy", "X_test.npy", "y_train.npy", "y_test.npy"]
    )

    if reprocess or not processed_exists:
        print("[train] Running preprocessing …")
        X_train, X_test, y_train, y_test = run_preprocessing()
    else:
        print("[train] Loading cached processed data …")
        X_train, X_test, y_train, y_test = load_processed(PROCESSED_DIR)

    input_dim = X_train.shape[1]
    print(f"[train] input_dim={input_dim}  "
          f"train={len(X_train)}  test={len(X_test)}")

    # ── Initialise model ─────────────────────────────────────────────────────
    model = NeuralNet(
        input_dim    = input_dim,
        hidden1      = hidden1,
        hidden2      = hidden2,
        lr           = lr,
        dropout_rate = dropout_rate,
        seed         = seed,
    )

    rng = np.random.default_rng(seed)
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    best_val_loss   = float("inf")
    best_weights    = None
    patience        = 10          # early stopping
    patience_counter = 0

    # ── Epoch loop ───────────────────────────────────────────────────────────
    for epoch in range(1, epochs + 1):
        epoch_losses = []

        for X_batch, y_batch in batch_generator(X_train, y_train, batch_size, rng):
            y_hat = model.forward(X_batch, training=True)
            loss  = binary_cross_entropy(y_batch, y_hat)
            model.backward(y_batch)
            epoch_losses.append(loss)

        train_loss = float(np.mean(epoch_losses))
        train_acc  = accuracy(y_train, model.predict_proba(X_train))

        # Validation (no dropout)
        val_proba  = model.predict_proba(X_test)
        val_loss   = binary_cross_entropy(y_test, val_proba)
        val_acc    = accuracy(y_test, val_proba)

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(float(val_loss))
        history["val_acc"].append(val_acc)

        if epoch % 5 == 0 or epoch == 1:
            print(f"Epoch {epoch:>4}/{epochs}  "
                  f"train_loss={train_loss:.4f}  train_acc={train_acc:.4f}  "
                  f"val_loss={val_loss:.4f}  val_acc={val_acc:.4f}")

        # ── Early stopping ───────────────────────────────────────────────────
        if val_loss < best_val_loss:
            best_val_loss    = val_loss
            best_weights     = {k: v.copy() for k, v in model.get_weights().items()}
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"[train] Early stopping at epoch {epoch}  "
                      f"best_val_loss={best_val_loss:.4f}")
                break

    # ── Restore best weights ─────────────────────────────────────────────────
    if best_weights is not None:
        model.set_weights(best_weights)
        print("[train] Restored best weights.")

    # ── Persist ──────────────────────────────────────────────────────────────
    os.makedirs(MODELS_DIR, exist_ok=True)
    save_weights(model.get_weights(), MODELS_DIR)
    save_training_history(history, MODELS_DIR)
    print(f"[train] Model saved → {MODELS_DIR}")

    return model


if __name__ == "__main__":
    train(epochs=100, batch_size=64, lr=1e-3)
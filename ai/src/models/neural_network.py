"""
neural_network.py
Two-hidden-layer binary classifier built entirely from scratch with numpy.

Architecture
------------
Input (5005) → Dense(256) → ReLU → Dropout → Dense(64) → ReLU → Dense(1) → Sigmoid

input_dim = vocab_size (5000) + structural features (5) = 5005
All forward pass, backprop, and weight update logic is hand-coded.
No ML libraries.
"""

import numpy as np


# ══════════════════════════════════════════════════════════════════════════════
#  Activation functions
# ══════════════════════════════════════════════════════════════════════════════

def _sigmoid(z: np.ndarray) -> np.ndarray:
    """Numerically stable sigmoid."""
    return np.where(
        z >= 0,
        1.0 / (1.0 + np.exp(-z)),
        np.exp(z) / (1.0 + np.exp(z)),
    )


def _relu(z: np.ndarray) -> np.ndarray:
    return np.maximum(0.0, z)


def _relu_grad(z: np.ndarray) -> np.ndarray:
    return (z > 0).astype(np.float32)


# ══════════════════════════════════════════════════════════════════════════════
#  Loss
# ══════════════════════════════════════════════════════════════════════════════

def binary_cross_entropy(y_true: np.ndarray,
                         y_pred: np.ndarray,
                         eps: float = 1e-9) -> float:
    """
    Binary cross-entropy loss.

    Parameters
    ----------
    y_true : (N,)  ground-truth labels {0, 1}
    y_pred : (N,)  predicted probabilities
    """
    y_pred = np.clip(y_pred, eps, 1.0 - eps)
    return float(-np.mean(
        y_true * np.log(y_pred) + (1.0 - y_true) * np.log(1.0 - y_pred)
    ))


# ══════════════════════════════════════════════════════════════════════════════
#  Neural Network
# ══════════════════════════════════════════════════════════════════════════════

class NeuralNetwork:
    """
    Binary classifier: input → hidden1 (ReLU) → hidden2 (ReLU) → output (Sigmoid)

    Parameters
    ----------
    input_dim    : number of input features  (vocab_size + 5 = 5005 by default)
    hidden1      : units in first hidden layer
    hidden2      : units in second hidden layer
    lr           : learning rate
    dropout_rate : fraction of hidden-1 activations zeroed during training
    seed         : random seed
    """

    def __init__(self,
                 input_dim:    int   = 5005,
                 hidden1:      int   = 256,
                 hidden2:      int   = 64,
                 lr:           float = 1e-3,
                 dropout_rate: float = 0.3,
                 seed:         int   = 42):

        self.lr           = lr
        self.dropout_rate = dropout_rate
        rng               = np.random.default_rng(seed)

        # He initialisation — well-suited for ReLU activations
        self.W1 = (rng.standard_normal((input_dim, hidden1))
                   * np.sqrt(2.0 / input_dim)).astype(np.float32)
        self.b1 = np.zeros((1, hidden1), dtype=np.float32)

        self.W2 = (rng.standard_normal((hidden1, hidden2))
                   * np.sqrt(2.0 / hidden1)).astype(np.float32)
        self.b2 = np.zeros((1, hidden2), dtype=np.float32)

        self.W3 = (rng.standard_normal((hidden2, 1))
                   * np.sqrt(2.0 / hidden2)).astype(np.float32)
        self.b3 = np.zeros((1, 1), dtype=np.float32)

        self._cache: dict = {}

    # ── Forward pass ──────────────────────────────────────────────────────────

    def forward(self, X: np.ndarray, training: bool = True) -> np.ndarray:
        """
        Parameters
        ----------
        X        : (batch_size, input_dim)
        training : apply dropout when True

        Returns
        -------
        y_hat : (batch_size,)  probability of AI-generated code
        """
        # Layer 1
        z1 = X @ self.W1 + self.b1                          # (N, h1)
        a1 = _relu(z1)

        # Inverted dropout on layer-1 activations
        if training and self.dropout_rate > 0:
            mask = (np.random.rand(*a1.shape) > self.dropout_rate).astype(np.float32)
            a1   = a1 * mask / (1.0 - self.dropout_rate)
        else:
            mask = np.ones_like(a1)

        # Layer 2
        z2 = a1 @ self.W2 + self.b2                         # (N, h2)
        a2 = _relu(z2)

        # Output layer
        z3 = a2 @ self.W3 + self.b3                         # (N, 1)
        a3 = _sigmoid(z3)

        # Cache everything needed for backprop
        self._cache = {
            "X": X, "z1": z1, "a1": a1, "mask": mask,
            "z2": z2, "a2": a2,
            "z3": z3, "a3": a3,
        }

        return a3.reshape(-1)                               # (N,)

    # ── Backward pass  ────────────────────────────────────────────────────────

    def backward(self, y_true: np.ndarray) -> None:
        """
        Compute gradients via backpropagation and apply gradient descent.

        Parameters
        ----------
        y_true : (N,)  ground-truth labels {0, 1}
        """
        N   = y_true.shape[0]
        c   = self._cache
        y_t = y_true.reshape(-1, 1)     # (N, 1)
        a3  = c["a3"]                   # (N, 1)

        # ── Output layer ──────────────────────────────────────────────────────
        # dL/dz3 simplifies to (a3 - y) when combining BCE loss + sigmoid grad
        dz3 = (a3 - y_t) / N
        dW3 = c["a2"].T @ dz3           # (h2, 1)
        db3 = dz3.sum(axis=0, keepdims=True)

        # ── Hidden layer 2 ────────────────────────────────────────────────────
        da2 = dz3 @ self.W3.T           # (N, h2)
        dz2 = da2 * _relu_grad(c["z2"])
        dW2 = c["a1"].T @ dz2           # (h1, h2)
        db2 = dz2.sum(axis=0, keepdims=True)

        # ── Hidden layer 1  (through inverted dropout) ────────────────────────
        da1 = dz2 @ self.W2.T           # (N, h1)
        da1 = da1 * c["mask"] / (1.0 - self.dropout_rate + 1e-9)
        dz1 = da1 * _relu_grad(c["z1"])
        dW1 = c["X"].T @ dz1            # (input_dim, h1)
        db1 = dz1.sum(axis=0, keepdims=True)

        # ── Gradient descent weight update ────────────────────────────────────
        self.W3 -= self.lr * dW3;  self.b3 -= self.lr * db3
        self.W2 -= self.lr * dW2;  self.b2 -= self.lr * db2
        self.W1 -= self.lr * dW1;  self.b1 -= self.lr * db1

    # ── Prediction ────────────────────────────────────────────────────────────

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Return probability of AI-generated for each sample. Shape (N,)."""
        return self.forward(X, training=False)

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """Return hard binary predictions {0, 1}."""
        return (self.predict_proba(X) >= threshold).astype(int)

    # ── Weight serialisation ──────────────────────────────────────────────────

    def get_weights(self) -> dict:
        return {
            "W1": self.W1, "b1": self.b1,
            "W2": self.W2, "b2": self.b2,
            "W3": self.W3, "b3": self.b3,
        }

    def set_weights(self, weights: dict) -> None:
        self.W1 = weights["W1"];  self.b1 = weights["b1"]
        self.W2 = weights["W2"];  self.b2 = weights["b2"]
        self.W3 = weights["W3"];  self.b3 = weights["b3"]
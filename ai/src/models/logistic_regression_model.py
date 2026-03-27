"""
logistic_regression_model.py

A two-layer neural network built entirely from scratch using numpy.
Architecture:
    Input (1541) → Dense (256) → ReLU → Dropout → Dense (64) → ReLU → Dense (1) → Sigmoid

All maths — forward pass, backprop, weight updates — are hand-coded.
No ML libraries used.
"""

import numpy as np


# ── Activation functions ─────────────────────────────────────────────────────

def sigmoid(z: np.ndarray) -> np.ndarray:
    """Numerically stable sigmoid."""
    return np.where(
        z >= 0,
        1.0 / (1.0 + np.exp(-z)),
        np.exp(z) / (1.0 + np.exp(z)),
    )


def sigmoid_derivative(a: np.ndarray) -> np.ndarray:
    """Derivative of sigmoid given its output a = sigmoid(z)."""
    return a * (1.0 - a)


def relu(z: np.ndarray) -> np.ndarray:
    return np.maximum(0.0, z)


def relu_derivative(z: np.ndarray) -> np.ndarray:
    return (z > 0).astype(np.float32)


# ── Loss ─────────────────────────────────────────────────────────────────────

def binary_cross_entropy(y_true: np.ndarray,
                         y_pred: np.ndarray,
                         eps: float = 1e-9) -> float:
    """
    Binary cross-entropy loss.

    Parameters
    ----------
    y_true : (N,)  ground-truth labels  {0, 1}
    y_pred : (N,)  predicted probabilities in (0, 1)
    eps    : small constant to avoid log(0)
    """
    y_pred = np.clip(y_pred, eps, 1.0 - eps)
    return -np.mean(y_true * np.log(y_pred) + (1.0 - y_true) * np.log(1.0 - y_pred))


# ── Neural Network ───────────────────────────────────────────────────────────

class NeuralNet:
    """
    Two-hidden-layer binary classifier.

    Layer sizes: input_dim → h1 → h2 → 1

    Parameters
    ----------
    input_dim   : number of input features (1541 for embedding + structural)
    hidden1     : units in first hidden layer  (default 256)
    hidden2     : units in second hidden layer (default 64)
    lr          : learning rate
    dropout_rate: fraction of h1 neurons to zero out during training
    seed        : random seed for reproducibility
    """

    def __init__(self,
                 input_dim:    int   = 1541,
                 hidden1:      int   = 256,
                 hidden2:      int   = 64,
                 lr:           float = 1e-3,
                 dropout_rate: float = 0.3,
                 seed:         int   = 42):

        self.lr           = lr
        self.dropout_rate = dropout_rate
        rng               = np.random.default_rng(seed)

        # He initialisation (good for ReLU)
        self.W1 = rng.standard_normal((input_dim, hidden1)).astype(np.float32) \
                  * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros((1, hidden1), dtype=np.float32)

        self.W2 = rng.standard_normal((hidden1, hidden2)).astype(np.float32) \
                  * np.sqrt(2.0 / hidden1)
        self.b2 = np.zeros((1, hidden2), dtype=np.float32)

        self.W3 = rng.standard_normal((hidden2, 1)).astype(np.float32) \
                  * np.sqrt(2.0 / hidden2)
        self.b3 = np.zeros((1, 1), dtype=np.float32)

        # Cache for backprop
        self._cache = {}

    # ── Forward pass ────────────────────────────────────────────────────────

    def forward(self, X: np.ndarray, training: bool = True) -> np.ndarray:
        """
        Parameters
        ----------
        X        : (batch, input_dim)
        training : if True, apply dropout on h1

        Returns
        -------
        y_hat : (batch,)  probability of AI-generated
        """
        # Layer 1
        z1 = X @ self.W1 + self.b1          # (N, hidden1)
        a1 = relu(z1)                        # (N, hidden1)

        # Dropout on layer 1 (training only)
        if training and self.dropout_rate > 0:
            mask = (np.random.rand(*a1.shape) > self.dropout_rate).astype(np.float32)
            a1   = a1 * mask / (1.0 - self.dropout_rate)   # inverted dropout
        else:
            mask = np.ones_like(a1)

        # Layer 2
        z2 = a1 @ self.W2 + self.b2         # (N, hidden2)
        a2 = relu(z2)                        # (N, hidden2)

        # Output layer
        z3 = a2 @ self.W3 + self.b3         # (N, 1)
        a3 = sigmoid(z3)                     # (N, 1)

        # Store for backprop
        self._cache = {
            "X": X, "z1": z1, "a1": a1, "mask": mask,
            "z2": z2, "a2": a2,
            "z3": z3, "a3": a3,
        }

        return a3.reshape(-1)               # (N,)

    # ── Backward pass ────────────────────────────────────────────────────────

    def backward(self, y_true: np.ndarray) -> None:
        """
        Compute gradients via backprop and update weights in-place.

        Parameters
        ----------
        y_true : (N,)  ground truth labels {0, 1}
        """
        N   = y_true.shape[0]
        c   = self._cache
        y_t = y_true.reshape(-1, 1)         # (N, 1)
        a3  = c["a3"]                       # (N, 1)

        # ── Output layer ────────────────────────────────────────────────────
        # dL/dz3 = a3 - y  (combined cross-entropy + sigmoid gradient)
        dz3 = (a3 - y_t) / N               # (N, 1)
        dW3 = c["a2"].T @ dz3              # (hidden2, 1)
        db3 = dz3.sum(axis=0, keepdims=True)

        # ── Hidden layer 2 ──────────────────────────────────────────────────
        da2 = dz3 @ self.W3.T              # (N, hidden2)
        dz2 = da2 * relu_derivative(c["z2"])
        dW2 = c["a1"].T @ dz2             # (hidden1, hidden2)
        db2 = dz2.sum(axis=0, keepdims=True)

        # ── Hidden layer 1 (with dropout) ───────────────────────────────────
        da1 = dz2 @ self.W2.T             # (N, hidden1)
        da1 = da1 * c["mask"] / (1.0 - self.dropout_rate + 1e-9)
        dz1 = da1 * relu_derivative(c["z1"])
        dW1 = c["X"].T @ dz1             # (input_dim, hidden1)
        db1 = dz1.sum(axis=0, keepdims=True)

        # ── Gradient descent update ──────────────────────────────────────────
        self.W3 -= self.lr * dW3
        self.b3 -= self.lr * db3
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2
        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1

    # ── Predict ─────────────────────────────────────────────────────────────

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Return probability of AI-generated for each sample. Shape (N,)."""
        return self.forward(X, training=False)

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """Return binary predictions {0, 1}."""
        return (self.predict_proba(X) >= threshold).astype(int)

    # ── Weight serialisation ─────────────────────────────────────────────────

    def get_weights(self) -> dict:
        return {
            "W1": self.W1, "b1": self.b1,
            "W2": self.W2, "b2": self.b2,
            "W3": self.W3, "b3": self.b3,
        }

    def set_weights(self, weights: dict) -> None:
        self.W1 = weights["W1"]
        self.b1 = weights["b1"]
        self.W2 = weights["W2"]
        self.b2 = weights["b2"]
        self.W3 = weights["W3"]
        self.b3 = weights["b3"]
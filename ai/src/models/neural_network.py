import numpy as np


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))


def relu(z):
    return np.maximum(0.0, z)


def relu_grad(z):
    return (z > 0).astype(np.float32)


def binary_cross_entropy(y_true, y_pred, eps=1e-9, pos_weight=1.0):
    y_pred = np.clip(y_pred, eps, 1.0 - eps)
    return float(-np.mean(
        pos_weight * y_true * np.log(y_pred) +
        (1.0 - y_true) * np.log(1.0 - y_pred)
    ))


class NeuralNetwork:
    def __init__(self, input_dim=14, hidden1=64, hidden2=32,
                 lr=5e-4, dropout_rate=0.3, l2_lambda=1e-4, seed=42):
        self.lr           = lr
        self.dropout_rate = dropout_rate
        self.l2_lambda    = l2_lambda
        rng               = np.random.default_rng(seed)

        def he(fan_in, fan_out):
            return (rng.standard_normal((fan_in, fan_out))
                    * np.sqrt(2.0 / fan_in)).astype(np.float32)

        self.W1 = he(input_dim, hidden1);  self.b1 = np.zeros((1, hidden1), np.float32)
        self.W2 = he(hidden1,   hidden2);  self.b2 = np.zeros((1, hidden2), np.float32)
        self.W3 = he(hidden2,   1);        self.b3 = np.zeros((1, 1),       np.float32)
        self._cache = {}

    def forward(self, X, training=True):
        z1 = X @ self.W1 + self.b1
        a1 = relu(z1)
        if training and self.dropout_rate > 0:
            mask = (np.random.rand(*a1.shape) > self.dropout_rate).astype(np.float32)
            a1   = a1 * mask / (1.0 - self.dropout_rate)
        else:
            mask = np.ones_like(a1)
        z2 = a1 @ self.W2 + self.b2
        a2 = relu(z2)
        z3 = a2 @ self.W3 + self.b3
        a3 = np.clip(sigmoid(z3), 1e-7, 1.0 - 1e-7)
        self._cache = {"X": X, "z1": z1, "a1": a1, "mask": mask,
                       "z2": z2, "a2": a2, "z3": z3, "a3": a3}
        return a3.reshape(-1)

    def backward(self, y_true, pos_weight=1.0):
        N   = y_true.shape[0]
        c   = self._cache
        y_t = y_true.reshape(-1, 1)
        a3  = c["a3"]

        dz3 = (a3 - y_t + (pos_weight - 1.0) * y_t * (1.0 - a3)) / N
        dW3 = c["a2"].T @ dz3;  db3 = dz3.sum(axis=0, keepdims=True)
        da2 = dz3 @ self.W3.T
        dz2 = da2 * relu_grad(c["z2"])
        dW2 = c["a1"].T @ dz2;  db2 = dz2.sum(axis=0, keepdims=True)
        da1 = dz2 @ self.W2.T
        da1 = da1 * c["mask"] / (1.0 - self.dropout_rate + 1e-9)
        dz1 = da1 * relu_grad(c["z1"])
        dW1 = c["X"].T @ dz1;   db1 = dz1.sum(axis=0, keepdims=True)

        dW3 += self.l2_lambda * self.W3
        dW2 += self.l2_lambda * self.W2
        dW1 += self.l2_lambda * self.W1

        self.W3 -= self.lr * dW3;  self.b3 -= self.lr * db3
        self.W2 -= self.lr * dW2;  self.b2 -= self.lr * db2
        self.W1 -= self.lr * dW1;  self.b1 -= self.lr * db1

    def predict_proba(self, X):
        return self.forward(X, training=False)

    def predict(self, X, threshold=0.5):
        return (self.predict_proba(X) >= threshold).astype(int)

    def get_weights(self):
        return {"W1": self.W1, "b1": self.b1,
                "W2": self.W2, "b2": self.b2,
                "W3": self.W3, "b3": self.b3}

    def set_weights(self, w):
        self.W1 = w["W1"]; self.b1 = w["b1"]
        self.W2 = w["W2"]; self.b2 = w["b2"]
        self.W3 = w["W3"]; self.b3 = w["b3"]
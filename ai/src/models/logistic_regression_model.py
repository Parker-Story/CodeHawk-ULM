import numpy as np

def sigmoid(z):
   return 1 / (1 + np.exp(-z))

class LogisticRegressionScratch:
   def __init__(self, learning_rate=0.01, iterations=1000):
       self.learning_rate = learning_rate
       self.iterations = iterations

   def fit(self, X, y):
       self.m, self.n = X.shape
       self.weights = np.zeros(self.n)
       self.bias = 0
       for _ in range(self.iterations):
           self._update_weights(X, y)

   def _update_weights(self, X, y):
       linear_model = np.dot(X, self.weights) + self.bias
       predictions = sigmoid(linear_model)
       dw = (1 / self.m) * np.dot(X.T, (predictions - y))
       db = (1 / self.m) * np.sum(predictions - y)
       self.weights -= self.learning_rate * dw
       self.bias -= self.learning_rate * db

   def predict(self, X):
       linear_model = np.dot(X, self.weights) + self.bias
       predictions = sigmoid(linear_model)
       return [1 if i > 0.5 else 0 for i in predictions]

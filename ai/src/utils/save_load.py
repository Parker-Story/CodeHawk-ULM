import json
import numpy as np

def save_model(model, filepath):
    """
    Save model weights, bias, and feature vocab to a JSON file.
    model: model instance (contains weights, bias, vocab)
    filepath: path to save JSON
    """
    model_data = {
        "weights": model.weights.tolist(),
        "bias": float(model.bias),
        "vocab": model.vocab
    }
    with open(filepath, "w") as file:
        json.dump(model_data, file)
    print(f"Model saved to {filepath}")


def load_model(filepath, model):
    """
    Load model from JSON and return an instance of model
    model: the class of model implementation used to create instance
    """
    with open(filepath, "r") as file:
        model_data = json.load(file)
    weights = np.array(model_data["weights"])
    bias = model_data["bias"]
    vocab = model_data["vocab"]
    return model(weights=weights, bias=bias, vocab=vocab)
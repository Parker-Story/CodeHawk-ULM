"""
test_prediction.py

THIS IS A TEMPORARY FILE TO BE USED IN TESTING THE PRETRAINED MODEL

Use the existing trained model to predict AI vs Human code
on a new CSV file with column "Sample_Code".

TO TEST ANY CSV
- change RAW_CSV to contain the csv file path and file name
- change load_and_preprocess to search for the appropriate column containing the code (case sensitive)
- all other columns in csv are automatically ignored

"""

import os
import numpy as np
import pandas as pd
import json

from src.models.neural_network import NeuralNetwork
from src.utils.save_load import load_weights, load_norm_stats
from src.data.preprocess import extract_feature_matrix

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODELS_DIR = os.path.join(BASE_DIR, "models")
RAW_CSV   = os.path.join(BASE_DIR, "data", "raw", "human_and_ai",
                         "HumanVsAI_CodeDataset.csv")
METADATA_DIR = os.path.join(BASE_DIR, "data", "metadata")
WEIGHT_KEYS = ["W1", "b1", "W2", "b2", "W3", "b3"]


def load_and_preprocess(csv_path: str):
    """Load CSV and extract 40 hand-crafted features."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"{csv_path} not found!")

    df = pd.read_csv(csv_path, low_memory=False)

    if "Sample_Code" not in df.columns:
        raise ValueError("CSV must contain 'Sample_Code' column")

    codes = df["Sample_Code"].astype(str).tolist()
    X = extract_feature_matrix(codes)

    # Load saved normalization stats
    mean, std = load_norm_stats(MODELS_DIR)
    std = np.where(std == 0, 1.0, std)
    X_norm = (X - mean) / std
    return df, X_norm


def predict(df, X_norm, threshold=0.5):
    """Load model and generate predictions."""
    weights = load_weights(MODELS_DIR, WEIGHT_KEYS)
    model = NeuralNetwork(input_dim=weights["W1"].shape[0])
    model.set_weights(weights)

    probs = model.predict_proba(X_norm)
    preds = (probs >= threshold).astype(int)

    df_result = df.copy()
    df_result["ai_probability"] = probs
    df_result["predicted_label"] = preds
    return df_result


def main():
    df, X_norm = load_and_preprocess(RAW_CSV)
    df_result = predict(df, X_norm)

    # Basic sanity check
    print(f"Predictions: min={df_result['ai_probability'].min():.4f}, "
          f"max={df_result['ai_probability'].max():.4f}, "
          f"mean={df_result['ai_probability'].mean():.4f}")

    os.makedirs(METADATA_DIR, exist_ok=True)
    out_path = os.path.join(METADATA_DIR, "test_predictions.csv")
    df_result.to_csv(out_path, index=False)
    print(f"[Done] Saved predictions -> {out_path}")

    # Also save JSON for convenience
    out_json = os.path.join(METADATA_DIR, "test_predictions.json")
    df_result.to_json(out_json, orient="records", lines=False)
    print(f"[Done] Saved predictions -> {out_json}")


if __name__ == "__main__":
    main()
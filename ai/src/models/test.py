"""
test.py
Evaluation of the trained model on the held-out test set.
All metrics implemented from scratch — no sklearn.
"""

import numpy as np
import os
import json

from src.models.logistic_regression_model import NeuralNet, binary_cross_entropy
from src.utils.save_load import load_weights, load_norm_stats, load_training_history
from src.data.preprocess import load_processed

MODELS_DIR    = os.path.join("models")
PROCESSED_DIR = os.path.join("data", "processed")
METADATA_DIR  = os.path.join("data", "metadata")

WEIGHT_KEYS = ["W1", "b1", "W2", "b2", "W3", "b3"]


# ── Metrics (all from scratch) ───────────────────────────────────────────────

def confusion_matrix(y_true: np.ndarray,
                     y_pred: np.ndarray) -> dict:
    """Return TP, FP, TN, FN counts."""
    TP = int(np.sum((y_pred == 1) & (y_true == 1)))
    FP = int(np.sum((y_pred == 1) & (y_true == 0)))
    TN = int(np.sum((y_pred == 0) & (y_true == 0)))
    FN = int(np.sum((y_pred == 0) & (y_true == 1)))
    return {"TP": TP, "FP": FP, "TN": TN, "FN": FN}


def precision(cm: dict) -> float:
    denom = cm["TP"] + cm["FP"]
    return cm["TP"] / denom if denom else 0.0


def recall(cm: dict) -> float:
    denom = cm["TP"] + cm["FN"]
    return cm["TP"] / denom if denom else 0.0


def f1_score(prec: float, rec: float) -> float:
    denom = prec + rec
    return 2.0 * prec * rec / denom if denom else 0.0


def accuracy_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.mean(y_true == y_pred))


def roc_auc(y_true: np.ndarray, y_proba: np.ndarray) -> float:
    """
    Compute AUC-ROC from scratch using the trapezoidal rule.
    Sorts by descending score, accumulates TPR/FPR, then integrates.
    """
    order = np.argsort(-y_proba)
    y_sorted = y_true[order]

    n_pos = int(np.sum(y_true))
    n_neg = len(y_true) - n_pos

    if n_pos == 0 or n_neg == 0:
        return 0.0

    tpr_list, fpr_list = [0.0], [0.0]
    tp, fp = 0, 0

    for label in y_sorted:
        if label == 1:
            tp += 1
        else:
            fp += 1
        tpr_list.append(tp / n_pos)
        fpr_list.append(fp / n_neg)

    # Trapezoidal integration
    auc = 0.0
    for i in range(1, len(tpr_list)):
        auc += (fpr_list[i] - fpr_list[i - 1]) * (tpr_list[i] + tpr_list[i - 1]) / 2.0
    return float(auc)


def calibration_curve(y_true: np.ndarray,
                      y_proba: np.ndarray,
                      n_bins: int = 10) -> tuple:
    """
    Bin predicted probabilities and compute mean predicted vs mean actual.
    Returns (mean_predicted, mean_actual) for each non-empty bin.
    """
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    mean_pred, mean_actual = [], []

    for i in range(n_bins):
        lo, hi = bins[i], bins[i + 1]
        mask = (y_proba >= lo) & (y_proba < hi)
        if mask.sum() == 0:
            continue
        mean_pred.append(float(y_proba[mask].mean()))
        mean_actual.append(float(y_true[mask].mean()))

    return mean_pred, mean_actual


# ── Full evaluation run ───────────────────────────────────────────────────────

def evaluate(threshold: float = 0.5) -> dict:
    """
    Load model + test set, compute all metrics, print and save results.

    Returns
    -------
    dict of all metric values
    """
    # Load data
    _, X_test, _, y_test = load_processed(PROCESSED_DIR)

    # Load model
    weights   = load_weights(MODELS_DIR, WEIGHT_KEYS)
    input_dim = weights["W1"].shape[0]
    model     = NeuralNet(input_dim=input_dim)
    model.set_weights(weights)

    # Inference
    y_proba = model.predict_proba(X_test)
    y_pred  = (y_proba >= threshold).astype(int)

    # Metrics
    cm    = confusion_matrix(y_test.astype(int), y_pred)
    prec  = precision(cm)
    rec   = recall(cm)
    f1    = f1_score(prec, rec)
    acc   = accuracy_score(y_test.astype(int), y_pred)
    auc   = roc_auc(y_test, y_proba)
    loss  = float(binary_cross_entropy(y_test, y_proba))

    cal_pred, cal_actual = calibration_curve(y_test, y_proba)

    results = {
        "accuracy":  acc,
        "precision": prec,
        "recall":    rec,
        "f1_score":  f1,
        "auc_roc":   auc,
        "loss":      loss,
        "confusion_matrix": cm,
        "calibration": {
            "mean_predicted": cal_pred,
            "mean_actual":    cal_actual,
        },
    }

    # Print summary
    print("\n" + "=" * 50)
    print("  EVALUATION RESULTS")
    print("=" * 50)
    print(f"  Accuracy  : {acc:.4f}")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  AUC-ROC   : {auc:.4f}")
    print(f"  BCE Loss  : {loss:.4f}")
    print(f"  Confusion Matrix: {cm}")
    print("=" * 50 + "\n")

    # Save
    os.makedirs(METADATA_DIR, exist_ok=True)
    out_path = os.path.join(METADATA_DIR, "evaluation_results.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[evaluate] Results saved → {out_path}")

    return results


if __name__ == "__main__":
    evaluate()
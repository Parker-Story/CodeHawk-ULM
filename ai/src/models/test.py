"""
test.py
Evaluates the trained model on the held-out test set.
All metrics are implemented from scratch — no sklearn.
Results are printed and saved to data/metadata/evaluation_results.json.
"""

import os
import json
import numpy as np

from src.models.neural_network import NeuralNetwork, binary_cross_entropy
from src.utils.save_load       import load_weights, load_norm_stats
from src.data.preprocess       import load_processed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODELS_DIR    = os.path.join(BASE_DIR, "models")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
METADATA_DIR  = os.path.join(BASE_DIR, "data", "metadata")
WEIGHT_KEYS   = ["W1", "b1", "W2", "b2", "W3", "b3"]


# ══════════════════════════════════════════════════════════════════════════════
#  Metrics  (all from scratch)
# ══════════════════════════════════════════════════════════════════════════════

def _confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    TP = int(np.sum((y_pred == 1) & (y_true == 1)))
    FP = int(np.sum((y_pred == 1) & (y_true == 0)))
    TN = int(np.sum((y_pred == 0) & (y_true == 0)))
    FN = int(np.sum((y_pred == 0) & (y_true == 1)))
    return {"TP": TP, "FP": FP, "TN": TN, "FN": FN}


def _precision(cm: dict) -> float:
    d = cm["TP"] + cm["FP"]
    return cm["TP"] / d if d else 0.0


def _recall(cm: dict) -> float:
    d = cm["TP"] + cm["FN"]
    return cm["TP"] / d if d else 0.0


def _f1(prec: float, rec: float) -> float:
    d = prec + rec
    return 2.0 * prec * rec / d if d else 0.0


def _accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.mean(y_true == y_pred))


def _roc_auc(y_true: np.ndarray, y_proba: np.ndarray) -> float:
    """AUC-ROC via trapezoidal rule."""
    order    = np.argsort(-y_proba)
    y_sorted = y_true[order]
    n_pos    = int(np.sum(y_true))
    n_neg    = len(y_true) - n_pos
    if n_pos == 0 or n_neg == 0:
        return 0.0

    tpr_pts, fpr_pts = [0.0], [0.0]
    tp = fp = 0
    for lbl in y_sorted:
        if lbl == 1:
            tp += 1
        else:
            fp += 1
        tpr_pts.append(tp / n_pos)
        fpr_pts.append(fp / n_neg)

    auc = sum(
        (fpr_pts[i] - fpr_pts[i - 1]) * (tpr_pts[i] + tpr_pts[i - 1]) / 2.0
        for i in range(1, len(tpr_pts))
    )
    return float(auc)


def _calibration_curve(y_true: np.ndarray,
                       y_proba: np.ndarray,
                       n_bins: int = 10) -> tuple:
    """Bin predicted probabilities; return (mean_predicted, mean_actual)."""
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    mean_pred, mean_actual = [], []
    for i in range(n_bins):
        mask = (y_proba >= bins[i]) & (y_proba < bins[i + 1])
        if mask.sum() == 0:
            continue
        mean_pred.append(float(y_proba[mask].mean()))
        mean_actual.append(float(y_true[mask].mean()))
    return mean_pred, mean_actual


# ══════════════════════════════════════════════════════════════════════════════
#  Full evaluation run
# ══════════════════════════════════════════════════════════════════════════════

def evaluate(threshold: float = 0.5) -> dict:
    """
    Load model + test set → compute all metrics → print + save results.

    Parameters
    ----------
    threshold : decision boundary for binary predictions

    Returns
    -------
    dict containing all metric values
    """
    # Load test data
    _, X_test, _, y_test = load_processed(PROCESSED_DIR)

    # Load model
    weights   = load_weights(MODELS_DIR, WEIGHT_KEYS)
    input_dim = weights["W1"].shape[0]
    model     = NeuralNetwork(input_dim=input_dim)
    model.set_weights(weights)

    # Inference
    y_proba = model.predict_proba(X_test)
    y_pred  = (y_proba >= threshold).astype(int)
    y_int   = y_test.astype(int)

    # Compute metrics
    cm   = _confusion_matrix(y_int, y_pred)
    prec = _precision(cm)
    rec  = _recall(cm)
    f1   = _f1(prec, rec)
    acc  = _accuracy(y_int, y_pred)
    auc  = _roc_auc(y_test, y_proba)
    loss = binary_cross_entropy(y_test, y_proba)
    cal_pred, cal_actual = _calibration_curve(y_test, y_proba)

    results = {
        "accuracy":         round(acc,  4),
        "precision":        round(prec, 4),
        "recall":           round(rec,  4),
        "f1_score":         round(f1,   4),
        "auc_roc":          round(auc,  4),
        "bce_loss":         round(loss, 4),
        "threshold_used":   threshold,
        "confusion_matrix": cm,
        "calibration": {
            "mean_predicted": cal_pred,
            "mean_actual":    cal_actual,
        },
    }

    # Print
    print("\n" + "═" * 52)
    print("  EVALUATION RESULTS")
    print("═" * 52)
    print(f"  Accuracy   : {acc:.4f}")
    print(f"  Precision  : {prec:.4f}")
    print(f"  Recall     : {rec:.4f}")
    print(f"  F1 Score   : {f1:.4f}")
    print(f"  AUC-ROC    : {auc:.4f}")
    print(f"  BCE Loss   : {loss:.4f}")
    print(f"  Confusion  : TP={cm['TP']} FP={cm['FP']} TN={cm['TN']} FN={cm['FN']}")
    print("═" * 52 + "\n")

    # Save
    os.makedirs(METADATA_DIR, exist_ok=True)
    out = os.path.join(METADATA_DIR, "evaluation_results.json")
    with open(out, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[evaluate] Results saved → {out}")

    return results


if __name__ == "__main__":
    evaluate()
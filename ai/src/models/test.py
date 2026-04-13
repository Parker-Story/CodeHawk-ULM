import os
import json
import numpy as np

from src.models.neural_network import NeuralNetwork, binary_cross_entropy
from src.utils.save_load       import load_weights
from src.data.preprocess       import load_processed, load_pos_weight

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR    = os.path.join(BASE_DIR, "models")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
METADATA_DIR  = os.path.join(BASE_DIR, "data", "metadata")
WEIGHT_KEYS   = ["W1", "b1", "W2", "b2", "W3", "b3"]


def confusion_matrix(y_true, y_pred):
    y_true = y_true.flatten()
    y_pred = y_pred.flatten()
    return {
        "TP": int(np.sum((y_pred == 1) & (y_true == 1))),
        "FP": int(np.sum((y_pred == 1) & (y_true == 0))),
        "TN": int(np.sum((y_pred == 0) & (y_true == 0))),
        "FN": int(np.sum((y_pred == 0) & (y_true == 1))),
    }


def precision(cm):
    d = cm["TP"] + cm["FP"];
    return cm["TP"] / d if d else 0.0
def recall(cm):
    d = cm["TP"] + cm["FN"];
    return cm["TP"] / d if d else 0.0
def f1_score(p, r):
    d = p + r;
    return 2 * p * r / d if d else 0.0


def roc_auc(y_true, y_proba):
    y_true  = y_true.flatten()
    y_proba = y_proba.flatten()
    order   = np.argsort(-y_proba)
    y_sorted = y_true[order]
    n_pos = int(np.sum(y_true))
    n_neg = len(y_true) - n_pos
    if n_pos == 0 or n_neg == 0:
        return 0.5
    tpr, fpr = [0.0], [0.0]
    tp = fp = 0
    for lbl in y_sorted:
        if lbl == 1: tp += 1
        else:        fp += 1
        tpr.append(tp / n_pos)
        fpr.append(fp / n_neg)
    return float(sum(
        (fpr[i] - fpr[i-1]) * (tpr[i] + tpr[i-1]) / 2
        for i in range(1, len(tpr))
    ))


def evaluate(threshold: float = 0.5) -> dict:
    _, X_test, _, y_test = load_processed(PROCESSED_DIR)
    weights    = load_weights(MODELS_DIR, WEIGHT_KEYS)
    model      = NeuralNetwork(input_dim=weights["W1"].shape[0])
    model.set_weights(weights)
    pos_weight = load_pos_weight(MODELS_DIR)

    y_proba = model.predict_proba(X_test)
    y_pred  = (y_proba >= threshold).astype(int)
    y_int   = y_test.astype(int).flatten()

    cm   = confusion_matrix(y_int, y_pred)
    prec = precision(cm)
    rec  = recall(cm)
    f1   = f1_score(prec, rec)
    acc  = float(np.mean(y_int == y_pred.flatten()))
    auc  = roc_auc(y_test, y_proba)
    loss = binary_cross_entropy(y_test, y_proba, pos_weight=pos_weight)

    results = {
        "accuracy":        round(acc,  4),
        "precision":       round(prec, 4),
        "recall":          round(rec,  4),
        "f1_score":        round(f1,   4),
        "auc_roc":         round(auc,  4),
        "bce_loss":        round(loss, 4),
        "threshold_used":  threshold,
        "pos_weight_used": pos_weight,
        "confusion_matrix": cm,
    }

    print("\n" + "=" * 52)
    print("  EVALUATION RESULTS")
    print("=" * 52)
    print(f"  Accuracy   : {acc:.4f}")
    print(f"  Precision  : {prec:.4f}")
    print(f"  Recall     : {rec:.4f}")
    print(f"  F1 Score   : {f1:.4f}")
    print(f"  AUC-ROC    : {auc:.4f}")
    print(f"  BCE Loss   : {loss:.4f}  (pos_weight={pos_weight:.2f})")
    print(f"  Confusion  : TP={cm['TP']} FP={cm['FP']} TN={cm['TN']} FN={cm['FN']}")
    print("=" * 52 + "\n")

    os.makedirs(METADATA_DIR, exist_ok=True)
    with open(os.path.join(METADATA_DIR, "evaluation_results.json"), "w") as f:
        json.dump(results, f, indent=2)
    return results


if __name__ == "__main__":
    evaluate()
"""
test.py — evaluation, all metrics from scratch.
"""

import os
import json
import numpy as np

from src.models.neural_network import NeuralNetwork, binary_cross_entropy
from src.utils.save_load       import load_weights
from src.data.preprocess       import load_processed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODELS_DIR    = os.path.join(BASE_DIR, "models")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
METADATA_DIR  = os.path.join(BASE_DIR, "data", "metadata")
WEIGHT_KEYS   = ["W1", "b1", "W2", "b2", "W3", "b3"]


def _cm(yt, yp):
    return {
        "TP": int(np.sum((yp==1)&(yt==1))), "FP": int(np.sum((yp==1)&(yt==0))),
        "TN": int(np.sum((yp==0)&(yt==0))), "FN": int(np.sum((yp==0)&(yt==1))),
    }

def _prec(cm):  d = cm["TP"]+cm["FP"]; return cm["TP"]/d if d else 0.0
def _rec(cm):   d = cm["TP"]+cm["FN"]; return cm["TP"]/d if d else 0.0
def _f1(p,r):   d = p+r; return 2*p*r/d if d else 0.0


def _roc_auc(yt, yp):
    order = np.argsort(-yp); ys = yt[order]
    np_, nn = int(np.sum(yt)), len(yt)-int(np.sum(yt))
    if np_==0 or nn==0: return 0.0
    tpr, fpr = [0.0], [0.0]; tp=fp=0
    for l in ys:
        if l==1: tp+=1
        else:    fp+=1
        tpr.append(tp/np_); fpr.append(fp/nn)
    return float(sum((fpr[i]-fpr[i-1])*(tpr[i]+tpr[i-1])/2
                     for i in range(1, len(tpr))))


def _calibration(yt, yp, n=10):
    bins=np.linspace(0,1,n+1); mp,ma=[],[]
    for i in range(n):
        mask=(yp>=bins[i])&(yp<bins[i+1])
        if mask.sum()==0: continue
        mp.append(float(yp[mask].mean())); ma.append(float(yt[mask].mean()))
    return mp, ma


def evaluate(threshold: float = 0.5) -> dict:
    _, X_test, _, y_test = load_processed(PROCESSED_DIR)
    weights   = load_weights(MODELS_DIR, WEIGHT_KEYS)
    model     = NeuralNetwork(input_dim=weights["W1"].shape[0])
    model.set_weights(weights)

    y_proba = model.predict_proba(X_test)
    y_pred  = (y_proba >= threshold).astype(int)
    y_int   = y_test.astype(int)

    cm   = _cm(y_int, y_pred)
    prec = _prec(cm); rec = _rec(cm); f1 = _f1(prec, rec)
    acc  = float(np.mean(y_int == y_pred))
    auc  = _roc_auc(y_test, y_proba)
    loss = binary_cross_entropy(y_test, y_proba)
    cp, ca = _calibration(y_test, y_proba)

    results = {
        "accuracy": round(acc,4), "precision": round(prec,4),
        "recall":   round(rec,4), "f1_score":  round(f1,4),
        "auc_roc":  round(auc,4), "bce_loss":  round(loss,4),
        "threshold_used": threshold, "confusion_matrix": cm,
        "calibration": {"mean_predicted": cp, "mean_actual": ca},
    }

    print("\n" + "="*52)
    print("  EVALUATION RESULTS")
    print("="*52)
    print(f"  Accuracy   : {acc:.4f}")
    print(f"  Precision  : {prec:.4f}")
    print(f"  Recall     : {rec:.4f}")
    print(f"  F1 Score   : {f1:.4f}")
    print(f"  AUC-ROC    : {auc:.4f}")
    print(f"  BCE Loss   : {loss:.4f}")
    print(f"  Confusion  : TP={cm['TP']} FP={cm['FP']} TN={cm['TN']} FN={cm['FN']}")
    print("="*52 + "\n")

    os.makedirs(METADATA_DIR, exist_ok=True)
    with open(os.path.join(METADATA_DIR, "evaluation_results.json"), "w") as f:
        json.dump(results, f, indent=2)
    return results


if __name__ == "__main__":
    evaluate()
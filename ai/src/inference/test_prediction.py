import os
import numpy as np
import pandas as pd

from src.models.neural_network import NeuralNetwork
from src.utils.save_load       import load_weights, load_norm_stats
from src.data.preprocess       import extract_features, extract_feature_matrix

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR   = os.path.join(BASE_DIR, "models")
METADATA_DIR = os.path.join(BASE_DIR, "data", "metadata")
WEIGHT_KEYS  = ["W1", "b1", "W2", "b2", "W3", "b3"]

CODE_EXTENSIONS = {".py", ".java"}


def load_model():
    weights  = load_weights(MODELS_DIR, WEIGHT_KEYS)
    model    = NeuralNetwork(input_dim=weights["W1"].shape[0])
    model.set_weights(weights)
    mean, std = load_norm_stats(MODELS_DIR)

    p1_path  = os.path.join(MODELS_DIR, "clip_p1.npy")
    p99_path = os.path.join(MODELS_DIR, "clip_p99.npy")
    clip_p1  = np.load(p1_path)  if os.path.exists(p1_path)  else None
    clip_p99 = np.load(p99_path) if os.path.exists(p99_path) else None

    if clip_p1 is None:
        print("[load_model] WARNING: clip bounds not found")

    return model, mean, std, clip_p1, clip_p99


def _normalise(X_raw, mean, std, clip_p1, clip_p99):
    if clip_p1 is not None:
        X_raw = np.clip(X_raw, clip_p1, clip_p99)
    return (X_raw - mean) / np.clip(std, 1e-8, None)


def _label(prob: float) -> tuple:
    if prob < 0.20:
        return "Human",     "High"
    elif prob < 0.40:
        return "Human",     "Medium"
    elif prob < 0.50:
        return "Human",     "Low"
    elif prob < 0.60:
        return "AI",        "Low"
    elif prob < 0.80:
        return "AI",        "Medium"
    else:
        return "AI",        "High"


def _predict_codes(codes, model, mean, std, clip_p1, clip_p99):
    X_raw  = extract_feature_matrix(codes)
    X_norm = _normalise(X_raw, mean, std, clip_p1, clip_p99)
    return model.predict_proba(X_norm)


def build_result_row(name, code, prob, true_label=None):
    val   = float(prob)
    label, conf = _label(val)
    row = {
        "name":           name,
        "ai_probability": round(val, 4),
        "ai_percentage":  round(val * 100, 2),
        "label":          label,
        "confidence":     conf,
    }
    if true_label is not None:
        row["correct"] = int((val >= 0.5) == bool(true_label))
    return row


def run_on_csv(csv_path: str, model, mean, std, clip_p1, clip_p99) -> list:
    df = pd.read_csv(csv_path, low_memory=False)
    code_col = next((c for c in ["code", "Sample_Code"] if c in df.columns), None)
    label_col = next((c for c in ["label", "Generated"] if c in df.columns), None)

    if code_col is None:
        raise ValueError(f"No code column found in {csv_path}")

    df = df.dropna(subset=[code_col])
    df = df[df[code_col].astype(str).str.lower().str.strip() != "nan"]
    df = df[df[code_col].astype(str).str.strip() != ""]

    codes = df[code_col].astype(str).tolist()
    probs = _predict_codes(codes, model, mean, std, clip_p1, clip_p99)

    results = []
    for i, (code, prob) in enumerate(zip(codes, probs)):
        true_label = None
        if label_col is not None:
            raw = df[label_col].iloc[i]
            true_label = 1 if str(raw).strip().lower() in ["ai", "1"] else 0

        results.append(build_result_row(f"row_{df.index[i]}", code, float(prob), true_label))

    return results


def run_on_file(file_path: str, model, mean, std, clip_p1, clip_p99) -> list:
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        code = f.read()
    x_raw  = extract_features(code)
    x_norm = _normalise(x_raw.reshape(1, -1), mean, std, clip_p1, clip_p99)
    prob   = float(np.clip(model.predict_proba(x_norm)[0], 0.0, 1.0))
    return [build_result_row(os.path.basename(file_path), code, prob)]


def run_on_directory(dir_path: str, model, mean, std, clip_p1, clip_p99) -> list:
    results = []
    for root, _, files in os.walk(dir_path):
        for fname in sorted(files):
            if os.path.splitext(fname)[1].lower() in CODE_EXTENSIONS:
                results.extend(run_on_file(
                    os.path.join(root, fname), model, mean, std, clip_p1, clip_p99
                ))
    return results


def print_summary(results: list) -> None:
    probs = [r["ai_probability"] for r in results]
    print(f"\n{'='*60}\n  PREDICTION SUMMARY  ({len(results)} samples)\n{'='*60}")
    print(f"  AI probability  min={min(probs):.4f}  max={max(probs):.4f}  mean={sum(probs)/len(probs):.4f}")
    labels = [r["label"] for r in results]
    for lbl in ["Human", "Uncertain", "AI"]:
        count = labels.count(lbl)
        print(f"  {lbl:<12}: {count:>5}  ({100*count/len(results):.1f}%)")
    if results and "correct" in results[0]:
        acc = sum(r["correct"] for r in results) / len(results)
        print(f"  Accuracy     : {acc*100:.2f}%")
    print(f"{'='*60}\n")
    if len(results) <= 50:
        for r in results:
            print(f"  [{r['label']:<9}] {r['ai_percentage']:6.2f}%  ({r['confidence']})  {r['name']}")
        print()


def save_results(results: list) -> None:
    os.makedirs(METADATA_DIR, exist_ok=True)
    df = pd.DataFrame(results)
    df.to_csv(os.path.join(METADATA_DIR, "test_predictions.csv"),  index=False)
    df.to_json(os.path.join(METADATA_DIR, "test_predictions.json"), orient="records", indent=2)
    print(f"[save_results] -> {METADATA_DIR}")


def main():
    # EDIT THESE FOR TESTING
    INPUT_MODE = "file"
    PATH = os.path.join(BASE_DIR, "data", "predict", "gemini.py")

    model, mean, std, clip_p1, clip_p99 = load_model()

    if INPUT_MODE == "file":
        results = run_on_file(PATH, model, mean, std, clip_p1, clip_p99)
    elif INPUT_MODE == "csv":
        results = run_on_csv(PATH, model, mean, std, clip_p1, clip_p99)
    else:
        results = run_on_directory(PATH, model, mean, std, clip_p1, clip_p99)

    if results:
        print_summary(results)
        save_results(results)


if __name__ == "__main__":
    main()
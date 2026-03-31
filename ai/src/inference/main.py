"""
main.py — FastAPI inference service
"""

import os
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.models.neural_network import NeuralNetwork
from src.utils.save_load import load_weights, load_norm_stats
from src.data.preprocess import extract_features
from src.data.preprocess import extract_features, FEATURE_NAMES

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")
WEIGHT_KEYS = ["W1", "b1", "W2", "b2", "W3", "b3"]

DEBUG_FEATURES = True

_model:     NeuralNetwork | None = None
_norm_mean: np.ndarray   | None = None
_norm_std:  np.ndarray   | None = None
_clip_p1:   np.ndarray   | None = None
_clip_p99:  np.ndarray   | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _norm_mean, _norm_std, _clip_p1, _clip_p99

    weights     = load_weights(MODELS_DIR, WEIGHT_KEYS)
    _model      = NeuralNetwork(input_dim=weights["W1"].shape[0])
    _model.set_weights(weights)

    _norm_mean, _norm_std = load_norm_stats(MODELS_DIR)

    # Load clip bounds saved by preprocess.py
    p1_path  = os.path.join(MODELS_DIR, "clip_p1.npy")
    p99_path = os.path.join(MODELS_DIR, "clip_p99.npy")
    if os.path.exists(p1_path) and os.path.exists(p99_path):
        _clip_p1  = np.load(p1_path)
        _clip_p99 = np.load(p99_path)
        print("[startup] Clip bounds loaded")
    else:
        print("[startup] WARNING: clip bounds not found — inference may be inaccurate")

    print(f"[startup] Model loaded  input_dim={weights['W1'].shape[0]}")
    yield
    print("[shutdown] Service stopped")


app = FastAPI(
    title="AI Code Detection Service",
    version="3.0.0",
    lifespan=lifespan
)


class DetectRequest(BaseModel):
    code: str


class DetectResponse(BaseModel):
    ai_probability: float
    ai_percentage:  float
    label:          str
    confidence:     str


def _label(prob: float) -> tuple[str, str]:
    if prob < 0.20:
        return "Human", "High"
    elif prob < 0.35:
        return "Human", "Medium"
    elif prob < 0.65:
        return "Uncertain", "Low"
    elif prob < 0.80:
        return "AI", "Medium"
    else:
        return "AI", "High"


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest):
    if _model is None:
        raise HTTPException(503, "Model not loaded")
    if not req.code.strip():
        raise HTTPException(400, "code must not be empty")

    # 1. Extract raw features
    x_raw = extract_features(req.code)

    # 2. Apply same percentile clipping used during training
    if _clip_p1 is not None and _clip_p99 is not None:
        x_raw = np.clip(x_raw, _clip_p1, _clip_p99)

    # 3. Z-score normalise
    x_norm = (x_raw - _norm_mean) / np.clip(_norm_std, 1e-8, None)

    # ─────────────────────────────────────────────
    # DEBUG: feature breakdown
    # ─────────────────────────────────────────────
    if DEBUG_FEATURES:
        print("\n" + "=" * 80)
        print("feature debug — why model made this prediction")
        print("=" * 80)

        n = min(len(FEATURE_NAMES), len(x_raw), len(x_norm))

        # feature-by-feature breakdown (safe)
        for i in range(n):
            name = FEATURE_NAMES[i]
            print(f"{name:20s} | raw={x_raw[i]:10.4f} | norm={x_norm[i]:10.4f}")

        print("-" * 80)
        print("top signal features (by magnitude)")

        contrib = np.abs(x_norm[:n])
        top_idx = np.argsort(-contrib)[:10]

        for i in top_idx:
            print(f"{FEATURE_NAMES[i]:20s} -> |norm|={contrib[i]:.4f}")

        print("=" * 80 + "\n")

    # 4. Forward pass
    prob = float(np.clip(
        _model.predict_proba(x_norm.reshape(1, -1))[0],
        0.0, 1.0
    ))

    label, conf = _label(prob)

    return DetectResponse(
        ai_probability = round(prob, 4),
        ai_percentage  = round(prob * 100, 2),
        label          = label,
        confidence     = conf,
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
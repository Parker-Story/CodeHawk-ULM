"""
main.py — FastAPI inference service.
Imports extract_features directly from preprocess.py so inference
is guaranteed to match training — no code duplication risk.
"""

import os
import numpy as np
from fastapi  import FastAPI, HTTPException
from pydantic import BaseModel

from src.models.neural_network import NeuralNetwork
from src.utils.save_load       import load_weights, load_norm_stats
from src.data.preprocess       import extract_features   # single source of truth

BASE_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR  = os.path.join(BASE_DIR, "models")
WEIGHT_KEYS = ["W1", "b1", "W2", "b2", "W3", "b3"]

app = FastAPI(title="AI Code Detection Service", version="2.0.0")

_model:     NeuralNetwork | None = None
_norm_mean: np.ndarray   | None = None
_norm_std:  np.ndarray   | None = None


@app.on_event("startup")
def _load() -> None:
    global _model, _norm_mean, _norm_std
    weights       = load_weights(MODELS_DIR, WEIGHT_KEYS)
    _model        = NeuralNetwork(input_dim=weights["W1"].shape[0])
    _model.set_weights(weights)
    _norm_mean, _norm_std = load_norm_stats(MODELS_DIR)
    print("[startup] Ready")


class DetectRequest(BaseModel):
    code: str


class DetectResponse(BaseModel):
    ai_probability: float
    ai_percentage:  float
    label:          str
    confidence:     str


def _label(prob: float) -> tuple:
    if prob < 0.20:   return "Human",     "High"
    elif prob < 0.35: return "Human",     "Medium"
    elif prob < 0.65: return "Uncertain", "Low"
    elif prob < 0.80: return "AI",        "Medium"
    else:             return "AI",        "High"


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest):
    if _model is None:
        raise HTTPException(503, "Model not loaded.")
    if not req.code or not req.code.strip():
        raise HTTPException(400, "code must not be empty.")

    # extract_features returns raw (40,) — must normalise with training stats
    x_raw  = extract_features(req.code)                        # (40,)
    x_norm = (x_raw - _norm_mean) / _norm_std                  # z-score
    prob   = float(np.clip(_model.predict_proba(
                       x_norm.reshape(1, -1))[0], 0.0, 1.0))

    label, conf = _label(prob)
    return DetectResponse(
        ai_probability = round(prob, 4),
        ai_percentage  = round(prob * 100.0, 2),
        label          = label,
        confidence     = conf,
    )
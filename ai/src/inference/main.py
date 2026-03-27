"""
main.py  —  FastAPI inference service
Loads trained weights once at startup, then serves predictions on POST /detect.
Called by the Spring Boot backend — never directly by the frontend.
"""

import os
import re
import ast
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.models.logistic_regression_model import NeuralNet
from src.utils.save_load import load_weights, load_norm_stats

# ── Config ───────────────────────────────────────────────────────────────────

MODELS_DIR  = os.path.join("models")
WEIGHT_KEYS = ["W1", "b1", "W2", "b2", "W3", "b3"]

# ── App + model (loaded once at startup) ─────────────────────────────────────

app   = FastAPI(title="AI Code Detection Service", version="1.0.0")
model: NeuralNet | None = None
norm_mean: np.ndarray | None = None
norm_std:  np.ndarray | None = None


@app.on_event("startup")
def load_model() -> None:
    global model, norm_mean, norm_std

    print("[startup] Loading model weights …")
    weights   = load_weights(MODELS_DIR, WEIGHT_KEYS)
    input_dim = weights["W1"].shape[0]

    model = NeuralNet(input_dim=input_dim)
    model.set_weights(weights)

    norm_mean, norm_std = load_norm_stats(MODELS_DIR)
    print("[startup] Model ready.")


# ── Request / Response schemas ────────────────────────────────────────────────

class DetectRequest(BaseModel):
    code:           str
    # Optional: pre-computed Ada embedding sent by caller (length 1536).
    # If omitted the service falls back to zero-vector (structural features only).
    ada_embedding:  list[float] | None = None


class DetectResponse(BaseModel):
    ai_probability: float   # 0.0 – 1.0
    ai_percentage:  float   # 0.0 – 100.0  (convenience field for frontend)
    label:          str     # "AI" | "Human" | "Uncertain"
    confidence:     str     # "High" | "Medium" | "Low"


# ── Feature extraction (mirrors preprocess.py) ────────────────────────────────

def _count_lines(code: str) -> int:
    return len(code.splitlines())


def _count_blank_lines(code: str) -> int:
    return sum(1 for ln in code.splitlines() if ln.strip() == "")


def _is_comment(line: str) -> bool:
    s = line.strip()
    return s.startswith(("#", "//", "*", "/*", "*/", "--"))


def _count_comment_lines(code: str) -> int:
    return sum(1 for ln in code.splitlines() if _is_comment(ln))


def _count_code_lines(code: str) -> int:
    return sum(
        1 for ln in code.splitlines()
        if ln.strip() and not _is_comment(ln)
    )


def _count_functions(code: str) -> int:
    patterns = [
        r"\bdef\s+\w+\s*\(",
        r"\b\w[\w\s\*]+\s+\w+\s*\([^)]*\)\s*\{",
        r"\bfunction\s+\w+\s*\(",
    ]
    return sum(len(re.findall(p, code)) for p in patterns)


def extract_features(code: str,
                     ada_embedding: list[float] | None) -> np.ndarray:
    """
    Build the same 1541-d feature vector used during training.

    Ada embedding : first 1536 dimensions
    Structural    : last 5 dimensions
    """
    # Ada embedding component
    if ada_embedding and len(ada_embedding) == 1536:
        embed = np.array(ada_embedding, dtype=np.float32)
    else:
        embed = np.zeros(1536, dtype=np.float32)

    structural = np.array([
        _count_lines(code),
        _count_code_lines(code),
        _count_comment_lines(code),
        _count_functions(code),
        _count_blank_lines(code),
    ], dtype=np.float32)

    return np.concatenate([embed, structural])          # (1541,)


def normalise_vector(x: np.ndarray) -> np.ndarray:
    """Apply the training-set z-score transform."""
    return (x - norm_mean) / norm_std


def probability_to_label(prob: float) -> tuple[str, str]:
    """
    Map raw probability to a human-readable label and confidence tier.

    Zones:
        0.00 – 0.35  →  Human    (High if < 0.20, else Medium)
        0.35 – 0.65  →  Uncertain (Low confidence)
        0.65 – 1.00  →  AI       (High if > 0.80, else Medium)
    """
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


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest) -> DetectResponse:
    """
    Accepts raw source code (and an optional Ada embedding vector).
    Returns the probability that the code was AI-generated.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")

    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Code field must not be empty.")

    # Build + normalise feature vector
    x      = extract_features(req.code, req.ada_embedding)   # (1541,)
    x_norm = normalise_vector(x)                              # (1541,)

    # Inference
    prob = float(model.predict_proba(x_norm.reshape(1, -1))[0])
    prob = float(np.clip(prob, 0.0, 1.0))

    label, confidence = probability_to_label(prob)

    return DetectResponse(
        ai_probability = round(prob, 4),
        ai_percentage  = round(prob * 100.0, 2),
        label          = label,
        confidence     = confidence,
    )
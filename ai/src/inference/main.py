"""
main.py  —  FastAPI inference service
Loads trained weights, vocab, and normalisation stats once at startup.
Exposes POST /detect for Spring Boot to call.

Flow per request
----------------
raw code string
  → tokenise (same logic as preprocess.py)
  → TF-IDF vector using saved vocab + IDF
  → concatenate with structural features
  → z-score normalise using saved mean/std
  → forward pass through loaded NeuralNetwork weights
  → return { ai_probability, ai_percentage, label, confidence }
"""

import os
import re
import numpy as np
from fastapi  import FastAPI, HTTPException
from pydantic import BaseModel

from src.models.neural_network import NeuralNetwork
from src.utils.save_load       import load_weights, load_norm_stats, load_vocab

MODELS_DIR  = os.path.join("models")
WEIGHT_KEYS = ["W1", "b1", "W2", "b2", "W3", "b3"]

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="AI Code Detection Service", version="1.0.0")

# Global state — populated at startup, reused for every request
_model:     NeuralNetwork | None = None
_vocab:     dict | None          = None
_idf:       np.ndarray | None    = None
_norm_mean: np.ndarray | None    = None
_norm_std:  np.ndarray | None    = None


@app.on_event("startup")
def _load_artifacts() -> None:
    global _model, _vocab, _idf, _norm_mean, _norm_std

    print("[startup] Loading model weights …")
    weights   = load_weights(MODELS_DIR, WEIGHT_KEYS)
    input_dim = weights["W1"].shape[0]
    _model    = NeuralNetwork(input_dim=input_dim)
    _model.set_weights(weights)

    print("[startup] Loading vocab + IDF …")
    _vocab, _idf = load_vocab(MODELS_DIR)

    print("[startup] Loading normalisation stats …")
    _norm_mean, _norm_std = load_norm_stats(MODELS_DIR)

    print("[startup] Ready ✓")


# ── Schemas ───────────────────────────────────────────────────────────────────

class DetectRequest(BaseModel):
    code: str                           # raw source code submitted by student


class DetectResponse(BaseModel):
    ai_probability: float               # 0.0 – 1.0
    ai_percentage:  float               # 0.0 – 100.0  (for the frontend bar)
    label:          str                 # "AI" | "Human" | "Uncertain"
    confidence:     str                 # "High" | "Medium" | "Low"


# ══════════════════════════════════════════════════════════════════════════════
#  Feature extraction  (mirrors preprocess.py exactly)
# ══════════════════════════════════════════════════════════════════════════════

def _tokenise(code: str) -> list:
    tokens = re.findall(
        r"[a-zA-Z_]\w*|[0-9]+(?:\.[0-9]+)?|[+\-*/=<>!&|^~%]+|[{}()\[\];:,.]",
        code
    )
    return [t.lower() for t in tokens if t.strip()]


def _tfidf_vector(tokens: list) -> np.ndarray:
    """Convert token list to TF-IDF vector using the saved vocab + IDF."""
    vec = np.zeros(len(_vocab), dtype=np.float32)
    if not tokens:
        return vec
    for tok in tokens:
        if tok in _vocab:
            vec[_vocab[tok]] += 1
    vec /= len(tokens)
    vec *= _idf
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec


def _is_comment(line: str) -> bool:
    s = line.strip()
    return s.startswith(("#", "//", "*", "/*", "*/", "--"))


def _structural_vector(code: str) -> np.ndarray:
    lines   = code.splitlines()
    total   = len(lines)
    blank   = sum(1 for ln in lines if ln.strip() == "")
    comment = sum(1 for ln in lines if _is_comment(ln))
    code_ln = sum(1 for ln in lines if ln.strip() and not _is_comment(ln))
    funcs   = sum(len(re.findall(p, code)) for p in [
        r"\bdef\s+\w+\s*\(",
        r"\b\w[\w\s\*]+\s+\w+\s*\([^)]*\)\s*\{",
        r"\bfunction\s+\w+\s*\(",
    ])
    return np.array([total, code_ln, comment, funcs, blank], dtype=np.float32)


def _build_feature_vector(code: str) -> np.ndarray:
    """
    Produce the same feature vector used during training:
        TF-IDF (vocab_size,) || structural (5,)  → normalised
    """
    tfidf      = _tfidf_vector(_tokenise(code))           # (vocab_size,)
    structural = _structural_vector(code)                 # (5,)
    x          = np.concatenate([tfidf, structural])      # (vocab_size + 5,)
    x_norm     = (x - _norm_mean) / _norm_std             # z-score
    return x_norm


# ══════════════════════════════════════════════════════════════════════════════
#  Label helper
# ══════════════════════════════════════════════════════════════════════════════

def _label(prob: float) -> tuple:
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


# ══════════════════════════════════════════════════════════════════════════════
#  Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest) -> DetectResponse:
    """
    Accepts raw source code, returns AI-detection probability.
    Called by Spring Boot — never directly by the frontend.
    """
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="code must not be empty.")

    x    = _build_feature_vector(req.code).reshape(1, -1)  # (1, input_dim)
    prob = float(np.clip(_model.predict_proba(x)[0], 0.0, 1.0))

    label, confidence = _label(prob)

    return DetectResponse(
        ai_probability = round(prob, 4),
        ai_percentage  = round(prob * 100.0, 2),
        label          = label,
        confidence     = confidence,
    )
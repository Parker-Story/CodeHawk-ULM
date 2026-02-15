AI Module - Capstone Project

This directory contains the AI-powered components of our capstone project. There are two distinct modules, each serving a different purpose. Both are designed to support academic integrity tools for a faculty-facing web application.

---

## Module 1: `plagiarism_checker`

### What It Does

This module detects **peer-to-peer (PTP) plagiarism** - it analyzes student code submissions and flags pairs of files that appear to share a common original source.

It uses a **two-engine approach**:

**Engine 1 - Basic Similarity (Fast)**
- Strips comments and normalizes whitespace
- Tokenizes and compares code structure
- Produces a fast baseline similarity score
- Works without any ML model

**Engine 2 - AI Semantic Similarity (Deep)**
- Uses [CodeBERT](https://github.com/microsoft/CodeBERT), a pretrained model from Microsoft trained on large code corpora
- Converts code into numeric vector embeddings that capture *meaning*, not just surface text
- Catches plagiarism even when students rename variables or reorder logic
- Free to use - no API costs

### Input / Output

| | |
|---|---|
| **Input** | A folder of `.java` or `.py` student submissions |
| **Output** | A ranked JSON report listing suspicious file pairs with similarity scores |

Scores range from `0.0` (no similarity) to `1.0` (near-identical). Pairs scoring above a configurable threshold are flagged for faculty review.

### Getting Started

**Install dependencies:**
```bash
pip install -r plagiarism_checker/requirements.txt
```

**Add student submissions:**

Place `.java` or `.py` files in:
```
plagiarism_checker/data/submissions/
```

**Run the file loader (quick test):**
```bash
python plagiarism_checker/src/loader.py
```

**Run the full checker:**
```bash
python plagiarism_checker/src/main.py
```

### Supported Languages

- Java (`.java`)
- Python (`.py`)

## Module 2: `legacy_ai_checker`

### What It Does

This module detects whether a given piece of student code was **AI-generated** (e.g., written by ChatGPT, Copilot, or similar tools) rather than produced by a human student.

This was the original AI component developed for the project. It has been preserved in this folder for reference and potential future integration.

> **Note:** Active development on this module has paused. The `plagiarism_checker` module is the current focus of development.

---

## Project Context

This AI module is one component of a larger capstone project that includes a Spring Boot backend, a relational database, and a faculty-facing web dashboard. The plagiarism checker is designed to be called by the backend and return structured report data that can be displayed and downloaded by faculty users.

---

## Status

| Module | Status |
|---|---|
| `plagiarism_checker` | 🟡 In Development |
| `legacy_ai_checker` | 🔵 Preserved / Paused |

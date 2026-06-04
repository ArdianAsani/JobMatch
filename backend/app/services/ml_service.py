"""
ml_service.py — SBERT semantic job matching service.

End-to-end flow:
  1. Build a single text string for the candidate  (headline + summary + skills)
  2. Build a single text string for each active job (title + description + requirements + skills_required)
  3. Encode all texts into dense sentence embeddings via SBERT (paraphrase-multilingual-MiniLM-L12-v2)
  4. Compute cosine similarity between the candidate vector and every job vector
  5. Persist each score into ml_match_results (upsert — one row per candidate/job pair)
  6. Return the top-N jobs sorted by descending similarity

Model is loaded once on first call and cached for the lifetime of the process.
Swap MODEL_NAME to use a fine-tuned model without changing any other code.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models.candidate_profile import CandidateProfile
from app.models.job_listing import JobListing
from app.models.ml_match_result import MLMatchResult


# ─── Configuration ────────────────────────────────────────────────────────────

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

# Absolute path to the locally saved model directory (backend/app/ml/<MODEL_NAME>).
# Run backend/setup_model.py once to populate this directory before starting the server.
_MODEL_LOCAL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "ml", MODEL_NAME)
)

# Checked top-to-bottom; first threshold that the score meets wins.
MATCH_THRESHOLDS: list[tuple[float, str]] = [
    (0.75, "Excellent Match"),
    (0.60, "Good Match"),
    (0.45, "Moderate Match"),
]
FALLBACK_LABEL = "Low Match"

# Global model cache — loaded lazily on first request.
_model: SentenceTransformer | None = None


# ─── Model Loading ────────────────────────────────────────────────────────────

def _get_model() -> SentenceTransformer:
    """
    Return the cached SBERT model, loading it on first call.

    Loads from the local directory at backend/app/ml/<MODEL_NAME> — no internet
    required. Run backend/setup_model.py once to download and save the model
    before starting the server for the first time.
    """
    global _model
    if _model is None:
        _model = SentenceTransformer(_MODEL_LOCAL_PATH)
    return _model


# ─── Text Builders ────────────────────────────────────────────────────────────

def build_candidate_text(candidate: CandidateProfile) -> str:
    """
    Concatenate all semantic profile fields into one string for embedding.

    Fields used:  headline  |  professional_summary  |  skills
    Missing fields are safely skipped via `or ""`.
    """
    parts = [
        candidate.headline or "",
        candidate.professional_summary or "",
        candidate.skills or "",
    ]
    return " ".join(p.strip() for p in parts if p.strip())


def build_job_text(job: JobListing) -> str:
    """
    Concatenate all semantic job fields into one string for embedding.

    Fields used:  title  |  description  |  requirements  |  skills_required
    Missing fields are safely skipped via `or ""`.
    """
    parts = [
        job.title or "",
        job.description or "",
        job.requirements or "",
        job.skills_required or "",
    ]
    return " ".join(p.strip() for p in parts if p.strip())


# ─── Scoring ──────────────────────────────────────────────────────────────────

def _get_match_label(score: float) -> str:
    """Map a cosine similarity score (0–1) to a human-readable label."""
    for threshold, label in MATCH_THRESHOLDS:
        if score >= threshold:
            return label
    return FALLBACK_LABEL


# ─── DB Upsert ────────────────────────────────────────────────────────────────

def _upsert_result(
    db: Session,
    existing_by_job_id: dict[int, MLMatchResult],
    candidate_id: int,
    job_id: int,
    score: float,
    label: str,
    candidate_text: str,
) -> None:
    """
    Insert a new MLMatchResult or update the existing row for this
    (candidate_id, job_id) pair — respecting the unique constraint.
    """
    existing = existing_by_job_id.get(job_id)
    now = datetime.now(timezone.utc)

    if existing:
        existing.cosine_similarity = score
        existing.confidence = round(score, 4)
        existing.match_label = label
        existing.model_version = MODEL_NAME
        existing.calculated_at = now
    else:
        new_row = MLMatchResult(
            candidate_id=candidate_id,
            job_id=job_id,
            cosine_similarity=score,
            confidence=round(score, 4),
            match_label=label,
            model_version=MODEL_NAME,
            # Store a truncated snapshot of the input text for debugging
            model_input=candidate_text[:500],
            calculated_at=now,
        )
        db.add(new_row)
        # Register new row in the local cache so we don't double-insert
        # if the same job_id appears twice (shouldn't happen, safety measure)
        existing_by_job_id[job_id] = new_row


# ─── Main Entry Point ─────────────────────────────────────────────────────────

def compute_matches(
    candidate: CandidateProfile,
    jobs: list[JobListing],
    db: Session,
    top_n: int = 10,
) -> list[dict]:
    """
    Core matching function.

    Steps:
      1. Build candidate_text from profile fields.
      2. Build job_text for each active job.
      3. Batch-encode all texts with SBERT (one model.encode call).
      4. Compute cosine similarity via dot product on L2-normalised vectors.
      5. Upsert every result into ml_match_results.
      6. Return top_n results sorted by descending cosine_similarity.

    Returns a list of dicts:
        { "job": JobListing, "cosine_similarity": float, "match_label": str }

    Returns [] when:
      - candidate profile is empty (no text to embed)
      - there are no active jobs
    """
    candidate_text = build_candidate_text(candidate)
    if not candidate_text.strip() or not jobs:
        return []

    model = _get_model()

    # Build one text string per job
    job_texts = [build_job_text(j) for j in jobs]

    # Encode everything in a single batch.
    # normalize_embeddings=True means cosine_similarity = dot_product (faster).
    all_texts = [candidate_text] + job_texts
    embeddings = model.encode(
        all_texts,
        normalize_embeddings=True,
        show_progress_bar=False,
        batch_size=64,
    )

    candidate_emb = embeddings[0]          # shape: (embedding_dim,)
    job_embs = embeddings[1:]              # shape: (num_jobs, embedding_dim)

    # Dot product of normalised vectors = cosine similarity
    scores: list[float] = np.dot(job_embs, candidate_emb).tolist()

    # Load all existing match rows for this candidate in one query
    existing_rows = (
        db.query(MLMatchResult)
        .filter(MLMatchResult.candidate_id == candidate.id)
        .all()
    )
    existing_by_job_id: dict[int, MLMatchResult] = {
        row.job_id: row for row in existing_rows
    }

    results: list[dict] = []
    for job, score in zip(jobs, scores):
        score = float(score)
        label = _get_match_label(score)
        _upsert_result(db, existing_by_job_id, candidate.id, job.id, score, label, candidate_text)
        results.append({"job": job, "cosine_similarity": score, "match_label": label})

    db.commit()

    # Sort by similarity descending, return top N
    results.sort(key=lambda x: -x["cosine_similarity"])
    return results[:top_n]

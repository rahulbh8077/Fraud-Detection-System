"""FraudShield AI — FastAPI Backend with Rules Engine & Analyst Case Management."""
from __future__ import annotations

import io
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Any, Optional

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse, FileResponse
from pydantic import BaseModel, Field, field_validator

from src.analytics import compute_dataset_analytics, load_metrics
from src.config import METRICS_PATH, VALID_TYPES
from src.data_preprocessing import quality_report, validate_paysim
from src.predict import load_model, predict_frame, predict_one
from src.report_generator import generate_csv_report, generate_xlsx_report
from src.rules_engine import DEFAULT_RULES, evaluate_rules
from src.case_manager import (
    list_cases, get_case_by_number, update_case, get_queue_metrics, seed_sample_cases_if_empty
)

app = FastAPI(
    title="FraudShield AI Enterprise",
    description="AI-Powered Transaction Risk, Rules Engine & Fraud Intelligence Platform",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_startup_time = datetime.now(timezone.utc)
seed_sample_cases_if_empty()


# ── Schemas ─────────────────────────────────────────────────────────────────

class Transaction(BaseModel):
    step: int = Field(ge=0, description="Time step (hour of simulation)")
    type: str = Field(description="Transaction type")
    amount: float = Field(ge=0, description="Transaction amount")
    oldbalanceOrg: float = Field(ge=0, description="Origin account balance before transaction")
    newbalanceOrig: float = Field(ge=0, description="Origin account balance after transaction")
    oldbalanceDest: float = Field(ge=0, description="Destination account balance before transaction")
    newbalanceDest: float = Field(ge=0, description="Destination account balance after transaction")

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        value = value.upper()
        if value not in VALID_TYPES:
            raise ValueError(f"type must be one of {sorted(VALID_TYPES)}")
        return value


class CaseUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    analyst_notes: Optional[str] = None
    analyst_verdict: Optional[str] = None


# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health() -> dict:
    """System health check."""
    t0 = time.perf_counter()
    model_ok = False
    model_version = None
    try:
        artifact = load_model()
        model_ok = True
        model_version = artifact.get("version")
    except FileNotFoundError:
        pass
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "status": "healthy" if model_ok else "degraded",
        "model_loaded": model_ok,
        "model_version": model_version,
        "api_version": "2.0.0",
        "uptime_since": _startup_time.isoformat(),
        "model_latency_ms": latency_ms,
        "services": {
            "api": "operational",
            "ml_model": "loaded" if model_ok else "unavailable",
            "rules_engine": "active",
            "case_management": "operational",
            "metrics": "available" if METRICS_PATH.exists() else "unavailable",
        }
    }


# ── Model Info ───────────────────────────────────────────────────────────────

@app.get("/model-info", tags=["Model"])
def model_info() -> dict:
    """Full model metadata and performance metrics."""
    if not METRICS_PATH.exists():
        raise HTTPException(404, "No model metrics available. Train with a labeled dataset first.")
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))


@app.get("/model-info/summary", tags=["Model"])
def model_summary() -> dict:
    """Lightweight model summary for dashboard display."""
    try:
        artifact = load_model()
        metrics = load_metrics() or {}
        return {
            "model_name": artifact.get("model_display_name", artifact.get("model_name", "FraudShield RF")),
            "model_version": artifact.get("version", "2.0"),
            "training_date": artifact.get("training_date"),
            "status": "online",
            "metrics": metrics.get("metrics", {}),
            "dataset_rows": metrics.get("dataset_rows"),
            "fraud_count": metrics.get("fraud_count"),
            "fraud_rate": metrics.get("fraud_rate"),
        }
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e


# ── Prediction ───────────────────────────────────────────────────────────────

@app.post("/predict", tags=["Prediction"])
def predict(transaction: Transaction) -> dict:
    """Analyze a single transaction for fraud risk, run rules engine, and compute SHAP explanations."""
    try:
        return predict_one(transaction.model_dump())
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e


@app.post("/predict/batch", tags=["Prediction"])
async def predict_batch(
    file: UploadFile = File(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
) -> dict:
    """Batch prediction on uploaded CSV/XLSX file."""
    if not file.filename.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(400, "Only CSV and XLSX files are supported.")
    
    content = await file.read()
    try:
        if file.filename.lower().endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Could not read file: {e}") from e
    
    if df.empty:
        raise HTTPException(400, "The uploaded file is empty.")
    
    try:
        results = predict_frame(df)
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e
    except Exception as e:
        raise HTTPException(422, f"Prediction failed: {e}") from e
    
    analytics = compute_dataset_analytics(results)
    
    total = len(results)
    start = (page - 1) * page_size
    end = start + page_size
    page_df = results.iloc[start:end]
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "analytics": analytics,
        "transactions": page_df.fillna("").to_dict(orient="records"),
    }


# ── Rules Engine ─────────────────────────────────────────────────────────────

@app.get("/rules", tags=["Rules Engine"])
def get_rules() -> dict:
    """Get all registered business rules."""
    return {
        "active_rules_count": len(DEFAULT_RULES),
        "rules": DEFAULT_RULES
    }


@app.post("/rules/evaluate", tags=["Rules Engine"])
def evaluate_custom_rules(transaction: Transaction) -> dict:
    """Test the rules engine on a specific transaction payload."""
    return evaluate_rules(transaction.model_dump())


# ── Case Management ──────────────────────────────────────────────────────────

@app.get("/cases/metrics", tags=["Case Management"])
def case_metrics() -> dict:
    """Summary statistics for the analyst review queue."""
    return get_queue_metrics()


@app.get("/cases", tags=["Case Management"])
def get_cases(
    status: Optional[str] = Query(None, description="Filter by status (e.g. PENDING_REVIEW, UNDER_INVESTIGATION)"),
    priority: Optional[str] = Query(None, description="Filter by priority (e.g. CRITICAL, HIGH)")
) -> dict:
    """List analyst cases with optional filters."""
    cases = list_cases(status=status, priority=priority)
    return {
        "total": len(cases),
        "cases": cases
    }


@app.get("/cases/{case_number}", tags=["Case Management"])
def get_case(case_number: str) -> dict:
    """Get details for a specific case number."""
    case = get_case_by_number(case_number)
    if not case:
        raise HTTPException(404, f"Case {case_number} not found.")
    return case


@app.patch("/cases/{case_number}", tags=["Case Management"])
def update_case_details(case_number: str, req: CaseUpdateRequest) -> dict:
    """Update analyst notes, assignment, status, or verdict for a case."""
    updated = update_case(
        case_number,
        status=req.status,
        assigned_to=req.assigned_to,
        notes=req.analyst_notes,
        verdict=req.analyst_verdict
    )
    if not updated:
        raise HTTPException(404, f"Case {case_number} not found.")
    return updated


# ── Upload & Validate ────────────────────────────────────────────────────────

@app.post("/upload/validate", tags=["Upload"])
async def upload_validate(file: UploadFile = File(...)) -> dict:
    """Validate an uploaded dataset without running predictions."""
    if not file.filename.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(400, "Only CSV and XLSX files are supported.")
    
    content = await file.read()
    try:
        if file.filename.lower().endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Could not read file: {e}") from e
    
    if df.empty:
        raise HTTPException(400, "The uploaded file is empty.")
    
    profile = quality_report(df)
    validation_errors = validate_paysim(df, require_target=False)
    has_target = "isFraud" in df.columns or "fraud" in [c.lower() for c in df.columns]
    
    return {
        "filename": file.filename,
        "valid": len(validation_errors) == 0,
        "errors": validation_errors,
        "profile": profile,
        "has_labels": has_target,
        "columns": list(df.columns),
        "sample": df.head(5).fillna("").to_dict(orient="records"),
    }


@app.post("/upload/analyze", tags=["Upload"])
async def upload_analyze(
    file: UploadFile = File(...),
    column_mapping: str = Form(default="{}"),
) -> dict:
    """Full dataset upload, validation, and fraud analysis."""
    if not file.filename.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(400, "Only CSV and XLSX files are supported.")
    
    content = await file.read()
    try:
        if file.filename.lower().endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Could not read file: {e}") from e
    
    if df.empty:
        raise HTTPException(400, "The uploaded file is empty.")
    
    try:
        mapping = json.loads(column_mapping)
    except Exception:
        mapping = {}
    
    if mapping:
        df = df.rename(columns={v: k for k, v in mapping.items() if v in df.columns})
    
    has_target = "isFraud" in df.columns
    
    try:
        results = predict_frame(df)
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e
    except Exception as e:
        raise HTTPException(422, f"Prediction failed: {e}") from e
    
    analytics = compute_dataset_analytics(results, has_labels=has_target)
    profile = quality_report(df)
    
    display_cols = [c for c in results.columns if c in [
        "type", "amount", "step", "fraud_probability", "risk_score",
        "risk_level", "predicted_fraud", "decision", "triggered_rules_count",
        "model_version", "prediction_timestamp", "isFraud"
    ]]
    top_results = results.sort_values("fraud_probability", ascending=False).head(100)
    
    return {
        "filename": file.filename,
        "profile": profile,
        "has_labels": has_target,
        "analytics": analytics,
        "top_results": top_results[display_cols].fillna("").to_dict(orient="records"),
    }


# ── Analytics ────────────────────────────────────────────────────────────────

@app.get("/analytics/overview", tags=["Analytics"])
def analytics_overview() -> dict:
    """Return training-time fraud analytics from stored metrics."""
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(404, "No analytics available. Train the model first.")
    return {
        "dataset_rows": metrics.get("dataset_rows"),
        "fraud_count": metrics.get("fraud_count"),
        "fraud_rate": metrics.get("fraud_rate"),
        "avg_amount": metrics.get("avg_amount"),
        "type_stats": metrics.get("type_stats", {}),
        "fraud_trend": metrics.get("fraud_trend", []),
        "selected_model": metrics.get("selected_model"),
        "model_display_name": metrics.get("model_display_name"),
        "metrics": metrics.get("metrics", {}),
    }


@app.get("/analytics/feature-importance", tags=["Analytics"])
def analytics_feature_importance() -> dict:
    """Return feature importances from the trained model."""
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(404, "No feature importance data. Train the model first.")
    return {
        "feature_importances": metrics.get("feature_importances", []),
        "model_name": metrics.get("model_display_name", metrics.get("selected_model")),
    }


@app.get("/analytics/confusion-matrix", tags=["Analytics"])
def analytics_confusion_matrix() -> dict:
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(404, "No metrics available.")
    return metrics.get("confusion_matrix", {})


@app.get("/analytics/roc-curve", tags=["Analytics"])
def analytics_roc_curve() -> dict:
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(404, "No metrics available.")
    return metrics.get("roc_curve", {})


@app.get("/analytics/pr-curve", tags=["Analytics"])
def analytics_pr_curve() -> dict:
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(404, "No metrics available.")
    return metrics.get("pr_curve", {})


# ── Reports ──────────────────────────────────────────────────────────────────

@app.post("/reports/download-csv", tags=["Reports"])
async def download_csv(file: UploadFile = File(...), column_mapping: str = Form(default="{}")) -> Response:
    """Run analysis and return CSV report."""
    content = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(content)) if file.filename.lower().endswith(".xlsx") else pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, str(e)) from e
    
    try:
        mapping = json.loads(column_mapping)
        if mapping:
            df = df.rename(columns={v: k for k, v in mapping.items() if v in df.columns})
        results = predict_frame(df)
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e
    except Exception as e:
        raise HTTPException(422, str(e)) from e
    
    csv_bytes = generate_csv_report(results)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="fraudshield_results.csv"'},
    )


@app.post("/reports/download-xlsx", tags=["Reports"])
async def download_xlsx(file: UploadFile = File(...), column_mapping: str = Form(default="{}")) -> Response:
    """Run analysis and return XLSX report."""
    content = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(content)) if file.filename.lower().endswith(".xlsx") else pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, str(e)) from e
    
    try:
        mapping = json.loads(column_mapping)
        if mapping:
            df = df.rename(columns={v: k for k, v in mapping.items() if v in df.columns})
        results = predict_frame(df)
    except FileNotFoundError as e:
        raise HTTPException(503, str(e)) from e
    except Exception as e:
        raise HTTPException(422, str(e)) from e
    
    analytics = compute_dataset_analytics(results)
    xlsx_bytes = generate_xlsx_report(results, analytics)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="fraudshield_report.xlsx"'},
    )


# ── Static Frontend Serving ────────────────────────────────────────────────

_FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"

if _FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(_FRONTEND_DIST / "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str = "") -> FileResponse:
        """Serve the React SPA for all non-API routes."""
        if full_path.startswith(("predict", "health", "model-info", "analytics", "upload", "reports", "rules", "cases", "api")):
            raise HTTPException(404, "Not found")
        index = _FRONTEND_DIST / "index.html"
        if index.exists():
            return FileResponse(str(index))
        raise HTTPException(404, "Frontend not built. Run: cd frontend && npm run build")

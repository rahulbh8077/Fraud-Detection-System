from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

from src.config import METRICS_PATH, VALID_TYPES
from src.predict import load_model, predict_one

app = FastAPI(title="Online Fraud Detection API", version="1.0")


class Transaction(BaseModel):
    step: int = Field(ge=0)
    type: str
    amount: float = Field(ge=0)
    oldbalanceOrg: float = Field(ge=0)
    newbalanceOrig: float = Field(ge=0)
    oldbalanceDest: float = Field(ge=0)
    newbalanceDest: float = Field(ge=0)

    @field_validator("type")
    @classmethod
    def validate_type(cls, value):
        value = value.upper()
        if value not in VALID_TYPES:
            raise ValueError(f"type must be one of {sorted(VALID_TYPES)}")
        return value


@app.get("/health")
def health():
    try:
        artifact = load_model()
        return {"status": "healthy", "model_loaded": True, "model_version": artifact.get("version")}
    except FileNotFoundError as error:
        return {"status": "model_unavailable", "model_loaded": False, "detail": str(error)}


@app.get("/model-info")
def model_info():
    if not METRICS_PATH.exists():
        raise HTTPException(404, "Model report unavailable. Train with a real dataset first.")
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))


@app.post("/predict")
def predict(transaction: Transaction):
    try:
        return predict_one(transaction.model_dump())
    except FileNotFoundError as error:
        raise HTTPException(503, str(error)) from error

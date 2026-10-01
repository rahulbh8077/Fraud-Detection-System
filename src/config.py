from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_DATA = ROOT / "data" / "raw"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"
MODEL_PATH = MODELS / "fraud_detection_model.joblib"
METRICS_PATH = REPORTS / "model_metrics.json"
RANDOM_STATE = 42

# PaySim columns used to make a decision.  Names are deliberately explicit.
MODEL_FEATURES = ["step", "type", "amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"]
TARGET = "isFraud"
VALID_TYPES = {"CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"}

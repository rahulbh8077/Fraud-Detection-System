from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from src.config import MODEL_PATH
from src.features import engineer_features


def risk_label(probability: float, low: float = 0.30, high: float = 0.70) -> tuple[str, str]:
    if probability >= high:
        return "HIGH", "FRAUDULENT"
    if probability >= low:
        return "MEDIUM", "SUSPICIOUS"
    return "LOW", "LEGITIMATE"


def load_model(path: Path = MODEL_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError("No trained model found. Add PaySim data and run `python -m src.train`.")
    return joblib.load(path)


def explanations(row: pd.Series, probability: float) -> list[str]:
    factors = []
    if row["amount"] >= 100000:
        factors.append("The transaction amount is high relative to the training schema.")
    if abs(row["origin_balance_error"]) > 1:
        factors.append("The origin balance movement is inconsistent with the transaction amount.")
    if str(row["type"]).upper() in {"TRANSFER", "CASH_OUT"}:
        factors.append("This transaction type contributed to the model's risk assessment.")
    if probability >= 0.7 and not factors:
        factors.append("The combined transaction characteristics contributed to elevated model risk.")
    return factors or ["No single feature was strongly elevated in this model assessment."]


def predict_frame(frame: pd.DataFrame, artifact: dict[str, Any] | None = None) -> pd.DataFrame:
    artifact = artifact or load_model()
    data = engineer_features(frame)
    probability = artifact["pipeline"].predict_proba(data[artifact["input_features"]])[:, 1]
    result = frame.copy()
    result["fraud_probability"] = probability
    result["risk_score"] = (probability * 100).round().astype(int)
    labels = [risk_label(float(p), artifact.get("low_threshold", .30), artifact.get("high_threshold", .70)) for p in probability]
    result["risk_level"] = [label[0] for label in labels]
    result["predicted_fraud"] = [label[1] for label in labels]
    result["model_version"] = artifact.get("version", "1.0")
    result["prediction_timestamp"] = datetime.now(timezone.utc).isoformat()
    return result


def predict_one(payload: dict[str, Any]) -> dict[str, Any]:
    artifact = load_model()
    prediction = predict_frame(pd.DataFrame([payload]), artifact).iloc[0]
    probability = float(prediction["fraud_probability"])
    return {"prediction": prediction["predicted_fraud"], "fraud_probability": round(probability, 6),
            "risk_score": int(prediction["risk_score"]), "risk_level": prediction["risk_level"],
            "transaction_type": prediction["type"], "explanation": explanations(engineer_features(pd.DataFrame([payload])).iloc[0], probability),
            "model_version": artifact.get("version", "1.0")}

"""FraudShield AI — Prediction, Rules Evaluation, and Explanation Module."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from src.config import MODEL_PATH
from src.features import engineer_features
from src.rules_engine import evaluate_rules, compute_composite_decision
from src.shap_explainer import compute_shap_explanations


def risk_label(probability: float, low: float = 0.30, high: float = 0.70) -> tuple[str, str]:
    """Map fraud probability to risk level and predicted label."""
    if probability >= 0.85:
        return "CRITICAL", "FRAUDULENT"
    if probability >= high:
        return "HIGH", "FRAUDULENT"
    if probability >= low:
        return "MEDIUM", "SUSPICIOUS"
    return "LOW", "LEGITIMATE"


def risk_score_from_probability(probability: float) -> int:
    """Convert probability to 0-100 risk score with non-linear scaling."""
    return min(100, int(round(probability * 100)))


def load_model(path: Path = MODEL_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(
            "No trained model found. Run: python -m src.train <dataset_path>"
        )
    return joblib.load(path)


def explanations(row: pd.Series, probability: float, feature_importances: list | None = None) -> list[dict]:
    """Generate structured explanation factors for a prediction."""
    factors = []
    
    amount = float(row.get("amount", 0) or 0)
    old_org = float(row.get("oldbalanceOrg", 0) or 0)
    new_org = float(row.get("newbalanceOrig", 0) or 0)
    origin_err = float(row.get("origin_balance_error", 0) or 0)
    dest_err = float(row.get("destination_balance_error", 0) or 0)
    tx_type = str(row.get("type", "")).upper()
    
    if amount >= 200_000:
        factors.append({
            "feature": "Transaction Amount",
            "value": f"${amount:,.2f}",
            "direction": "increases",
            "description": "Unusually large transaction amount relative to training distribution."
        })
    elif amount >= 100_000:
        factors.append({
            "feature": "Transaction Amount",
            "value": f"${amount:,.2f}",
            "direction": "increases",
            "description": "High transaction amount contributed to the model's risk assessment."
        })
    
    if origin_err > 1:
        factors.append({
            "feature": "Origin Balance Inconsistency",
            "value": f"${origin_err:,.2f}",
            "direction": "increases",
            "description": "Origin account balance movement is inconsistent with transaction amount."
        })
    
    if dest_err > 1:
        factors.append({
            "feature": "Destination Balance Inconsistency",
            "value": f"${dest_err:,.2f}",
            "direction": "increases",
            "description": "Destination account balance movement is inconsistent with transaction amount."
        })
    
    if tx_type in {"TRANSFER", "CASH_OUT"}:
        factors.append({
            "feature": "Transaction Type",
            "value": tx_type,
            "direction": "increases",
            "description": f"{tx_type} transactions are more frequently associated with fraudulent activity in training data."
        })
    
    if old_org > 0 and new_org < 10 and amount > 1000:
        factors.append({
            "feature": "Origin Balance Drain",
            "value": f"Before: ${old_org:,.2f} → After: ${new_org:,.2f}",
            "direction": "increases",
            "description": "Origin account balance was nearly or completely drained by this transaction."
        })
    
    if probability >= 0.70 and not factors:
        factors.append({
            "feature": "Combined Transaction Profile",
            "value": f"{probability:.1%} probability",
            "direction": "increases",
            "description": "The combined transaction characteristics contributed to an elevated model risk score."
        })
    
    if probability < 0.30 and not factors:
        factors.append({
            "feature": "Low-Risk Profile",
            "value": f"{probability:.1%} probability",
            "direction": "decreases",
            "description": "No individual features significantly elevated risk in this assessment."
        })
    
    return factors


def predict_frame(frame: pd.DataFrame, artifact: dict[str, Any] | None = None) -> pd.DataFrame:
    artifact = artifact or load_model()
    data = engineer_features(frame)
    probability = artifact["pipeline"].predict_proba(data[artifact["input_features"]])[:, 1]
    result = frame.copy()
    result["fraud_probability"] = probability.round(6)
    result["risk_score"] = [risk_score_from_probability(float(p)) for p in probability]
    labels = [
        risk_label(float(p), artifact.get("low_threshold", 0.30), artifact.get("high_threshold", 0.70))
        for p in probability
    ]
    result["risk_level"] = [label[0] for label in labels]
    result["predicted_fraud"] = [label[1] for label in labels]

    # Evaluate rules & decisions per row
    decisions = []
    rule_counts = []
    for idx, row in frame.iterrows():
        eval_res = evaluate_rules(row.to_dict())
        comp_dec = compute_composite_decision(
            float(result.loc[idx, "fraud_probability"]),
            int(result.loc[idx, "risk_score"]),
            eval_res["triggered_rules"]
        )
        decisions.append(comp_dec["decision"])
        rule_counts.append(eval_res["triggered_count"])

    result["decision"] = decisions
    result["triggered_rules_count"] = rule_counts
    result["model_version"] = artifact.get("version", "1.0")
    result["prediction_timestamp"] = datetime.now(timezone.utc).isoformat()
    return result


def predict_one(payload: dict[str, Any]) -> dict[str, Any]:
    artifact = load_model()
    df = pd.DataFrame([payload])
    
    # Feature engineering
    data = engineer_features(df)
    input_features = artifact["input_features"]
    pipeline = artifact["pipeline"]

    # Model probability
    probability = float(pipeline.predict_proba(data[input_features])[:, 1][0])
    risk_score = risk_score_from_probability(probability)

    risk_lv, pred_label = risk_label(
        probability,
        artifact.get("low_threshold", 0.30),
        artifact.get("high_threshold", 0.70)
    )

    # Hybrid Rules Engine Evaluation
    rules_result = evaluate_rules(payload)
    composite_decision = compute_composite_decision(probability, risk_score, rules_result["triggered_rules"])

    # SHAP & Feature Attribution Explanations
    shap_factors = compute_shap_explanations(pipeline, data, input_features)

    # Heuristic Explanation Factors
    engineered = data.iloc[0]
    heuristic_factors = explanations(engineered, probability)

    # Action recommendation
    dec = composite_decision["decision"]
    if dec == "BLOCK":
        action = "Immediately flag for manual review. Block pending investigation."
    elif dec == "MANUAL_REVIEW":
        action = "Flag for additional review. Require analyst sign-off before settlement."
    elif dec == "CHALLENGE":
        action = "Request additional 2FA / OTP step-up verification before processing."
    else:
        action = "No additional action recommended. Transaction appears low-risk."

    result = {
        "prediction": pred_label,
        "fraud_probability": round(probability, 6),
        "risk_score": risk_score,
        "risk_level": risk_lv,
        "transaction_type": str(payload.get("type", "")),
        "amount": float(payload.get("amount", 0)),
        "decision": dec,
        "decision_reason": composite_decision["decision_reason"],
        "requires_analyst_review": composite_decision["requires_analyst_review"],
        "requires_stepup_auth": composite_decision["requires_stepup_auth"],
        "triggered_rules": rules_result["triggered_rules"],
        "explanation": heuristic_factors,
        "shap_explanations": shap_factors,
        "recommended_action": action,
        "model_name": artifact.get("model_display_name", artifact.get("model_name", "FraudShield RF")),
        "model_version": artifact.get("version", "1.0"),
        "training_date": artifact.get("training_date", "Unknown"),
        "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # Automatically create analyst case if flagged
    if composite_decision["requires_analyst_review"]:
        try:
            from src.case_manager import create_case
            case_info = create_case(payload, result)
            if case_info:
                result["case_number"] = case_info.get("case_number")
        except Exception:
            pass

    return result

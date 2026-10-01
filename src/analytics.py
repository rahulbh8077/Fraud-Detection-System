"""Analytics computations for FraudShield AI backend."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from src.config import METRICS_PATH, TARGET


def load_metrics() -> dict[str, Any] | None:
    """Load saved model metrics report."""
    if METRICS_PATH.exists():
        return json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    return None


def compute_dataset_analytics(df: pd.DataFrame, has_labels: bool = False) -> dict[str, Any]:
    """Compute fraud analytics from a predictions dataframe."""
    total = len(df)
    
    # Risk distribution
    risk_counts = df["risk_level"].value_counts().to_dict() if "risk_level" in df.columns else {}
    risk_dist = {
        "CRITICAL": int(risk_counts.get("CRITICAL", 0)),
        "HIGH": int(risk_counts.get("HIGH", 0)),
        "MEDIUM": int(risk_counts.get("MEDIUM", 0)),
        "LOW": int(risk_counts.get("LOW", 0)),
    }
    
    # Predicted fraud counts
    predicted_fraud = int((df["predicted_fraud"] == "FRAUDULENT").sum()) if "predicted_fraud" in df.columns else 0
    predicted_suspicious = int((df["predicted_fraud"] == "SUSPICIOUS").sum()) if "predicted_fraud" in df.columns else 0
    
    # Avg probability
    avg_prob = float(df["fraud_probability"].mean()) if "fraud_probability" in df.columns else 0.0
    
    # By transaction type
    type_stats = []
    if "type" in df.columns and "fraud_probability" in df.columns:
        for tx_type, group in df.groupby("type"):
            flagged = int((group["predicted_fraud"] == "FRAUDULENT").sum()) if "predicted_fraud" in group.columns else 0
            type_stats.append({
                "type": str(tx_type),
                "count": int(len(group)),
                "flagged": flagged,
                "flag_rate": round(float(flagged / len(group)), 4) if len(group) > 0 else 0.0,
                "avg_probability": round(float(group["fraud_probability"].mean()), 4),
                "avg_risk_score": round(float(group["risk_score"].mean()), 1) if "risk_score" in group.columns else 0.0,
            })
    
    # High-risk transactions
    high_risk_df = df[
        df["risk_level"].isin(["HIGH", "CRITICAL"])
    ].sort_values("fraud_probability", ascending=False).head(50) if "risk_level" in df.columns else pd.DataFrame()
    
    high_risk = []
    for _, row in high_risk_df.iterrows():
        high_risk.append({
            "type": str(row.get("type", "")),
            "amount": float(row.get("amount", 0)),
            "risk_level": str(row.get("risk_level", "")),
            "risk_score": int(row.get("risk_score", 0)),
            "fraud_probability": round(float(row.get("fraud_probability", 0)), 4),
            "predicted_fraud": str(row.get("predicted_fraud", "")),
        })
    
    # Amount distribution bins
    if "amount" in df.columns:
        amounts = pd.to_numeric(df["amount"], errors="coerce").dropna()
        hist, edges = np.histogram(np.log1p(amounts.clip(lower=0)), bins=20)
        amount_hist = [
            {"bin_start": round(float(np.expm1(edges[i])), 2),
             "bin_end": round(float(np.expm1(edges[i+1])), 2),
             "count": int(hist[i])}
            for i in range(len(hist))
        ]
    else:
        amount_hist = []
    
    result: dict[str, Any] = {
        "total": total,
        "predicted_fraud": predicted_fraud,
        "predicted_suspicious": predicted_suspicious,
        "predicted_legitimate": total - predicted_fraud - predicted_suspicious,
        "avg_fraud_probability": round(avg_prob, 4),
        "risk_distribution": risk_dist,
        "type_stats": type_stats,
        "high_risk_transactions": high_risk,
        "amount_distribution": amount_hist,
    }
    
    if has_labels and TARGET in df.columns:
        from sklearn.metrics import accuracy_score, average_precision_score, f1_score, precision_score, recall_score, roc_auc_score
        actual = pd.to_numeric(df[TARGET], errors="coerce").fillna(0).astype(int)
        prob = df["fraud_probability"].fillna(0)
        pred = (prob >= 0.5).astype(int)
        result["supervised_metrics"] = {
            "accuracy": round(float(accuracy_score(actual, pred)), 4),
            "precision": round(float(precision_score(actual, pred, zero_division=0)), 4),
            "recall": round(float(recall_score(actual, pred, zero_division=0)), 4),
            "f1": round(float(f1_score(actual, pred, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(actual, prob)) if actual.sum() > 0 else 0.0, 4),
            "pr_auc": round(float(average_precision_score(actual, prob)) if actual.sum() > 0 else 0.0, 4),
            "actual_fraud": int(actual.sum()),
            "actual_legitimate": int((actual == 0).sum()),
        }
    
    return result

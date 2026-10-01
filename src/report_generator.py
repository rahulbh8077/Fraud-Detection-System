"""Report generation for FraudShield AI."""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any

import pandas as pd


def generate_csv_report(results_df: pd.DataFrame) -> bytes:
    """Generate a CSV report from predictions dataframe."""
    buf = io.BytesIO()
    results_df.to_csv(buf, index=False, encoding="utf-8")
    return buf.getvalue()


def generate_xlsx_report(results_df: pd.DataFrame, analytics: dict[str, Any] | None = None) -> bytes:
    """Generate a multi-sheet XLSX report."""
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        # Sheet 1: All predictions
        results_df.to_excel(writer, sheet_name="Predictions", index=False)
        
        # Sheet 2: High-risk transactions
        if "risk_level" in results_df.columns:
            high_risk = results_df[
                results_df["risk_level"].isin(["HIGH", "CRITICAL"])
            ].sort_values("fraud_probability", ascending=False)
            high_risk.to_excel(writer, sheet_name="High Risk", index=False)
        
        # Sheet 3: Summary analytics
        if analytics:
            summary_rows = [
                ["Metric", "Value"],
                ["Total Transactions", analytics.get("total", 0)],
                ["Predicted Fraud", analytics.get("predicted_fraud", 0)],
                ["Predicted Suspicious", analytics.get("predicted_suspicious", 0)],
                ["Predicted Legitimate", analytics.get("predicted_legitimate", 0)],
                ["Avg Fraud Probability", f"{analytics.get('avg_fraud_probability', 0):.2%}"],
                ["Report Generated", datetime.now(timezone.utc).isoformat()],
            ]
            summary_df = pd.DataFrame(summary_rows[1:], columns=summary_rows[0])
            summary_df.to_excel(writer, sheet_name="Summary", index=False)
            
            # Type stats
            if analytics.get("type_stats"):
                type_df = pd.DataFrame(analytics["type_stats"])
                type_df.to_excel(writer, sheet_name="By Type", index=False)
    
    return buf.getvalue()

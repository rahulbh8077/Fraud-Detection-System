"""FraudShield AI — SHAP & Feature Attribution Explainer."""
from __future__ import annotations

from typing import Any, Dict, List
import pandas as pd
import numpy as np


def compute_shap_explanations(
    pipeline: Any,
    feature_df: pd.DataFrame,
    feature_names: List[str]
) -> List[Dict[str, Any]]:
    """Compute SHAP / Feature Attributions for a single transaction input row.

    Returns structured feature contribution percentages and risk impact.
    """
    row_df = feature_df[feature_names].iloc[[0]]
    row_series = row_df.iloc[0]

    try:
        import shap
        named_steps = getattr(pipeline, "named_steps", {})
        model_obj = named_steps.get("model", named_steps.get("classifier", pipeline))
        
        # Transform data if ColumnTransformer exists
        if "preprocess" in named_steps:
            transformed_arr = named_steps["preprocess"].transform(row_df)
        elif "preprocessor" in named_steps:
            transformed_arr = named_steps["preprocessor"].transform(row_df)
        else:
            transformed_arr = row_df.values

        if hasattr(model_obj, "estimators_") or hasattr(model_obj, "tree_"):
            explainer = shap.TreeExplainer(model_obj)
            shap_vals = explainer.shap_values(transformed_arr)
            
            # Select target class output (class 1: Fraud)
            if isinstance(shap_vals, list) and len(shap_vals) > 1:
                raw_shap = shap_vals[1][0]
            elif isinstance(shap_vals, np.ndarray) and shap_vals.ndim == 3:
                raw_shap = shap_vals[0, :, 1]
            elif isinstance(shap_vals, np.ndarray) and shap_vals.ndim == 2:
                raw_shap = shap_vals[0]
            else:
                raw_shap = np.array(shap_vals).flatten()

            # Aggregate sub-features (e.g., OHE types) back to raw input features
            importances = _aggregate_transformed_shap_to_inputs(raw_shap, feature_names)
        else:
            importances = _heuristic_feature_attribution(model_obj, row_series, feature_names)

    except Exception:
        # Fallback to heuristic feature attribution if shap array processing differs
        named_steps = getattr(pipeline, "named_steps", {})
        model_obj = named_steps.get("model", named_steps.get("classifier", pipeline))
        importances = _heuristic_feature_attribution(model_obj, row_series, feature_names)

    # Calculate percentages & impact
    total_abs = float(np.sum(np.abs(importances))) or 1.0

    explanations = []
    for i, name in enumerate(feature_names):
        val_imp = float(importances[i])
        raw_val = float(row_series[name]) if isinstance(row_series[name], (int, float, np.number)) else str(row_series[name])
        contrib_pct = round((abs(val_imp) / total_abs) * 100, 2)
        impact = "INCREASES_RISK" if val_imp > 0 else ("DECREASES_RISK" if val_imp < 0 else "NEUTRAL")

        explanations.append({
            "feature": name,
            "feature_label": name.replace("_", " ").title(),
            "value": raw_val,
            "shap_value": round(val_imp, 6),
            "contribution_percentage": contrib_pct,
            "impact": impact,
        })

    # Sort by contribution percentage descending
    explanations.sort(key=lambda x: x["contribution_percentage"], reverse=True)
    return explanations


def _aggregate_transformed_shap_to_inputs(raw_shap: np.ndarray, feature_names: List[str]) -> np.ndarray:
    """Map transformed SHAP array back to original feature names."""
    # 13 numeric features + OHE type features (5 categories = 18 total)
    if len(raw_shap) >= len(feature_names):
        n_num = 13  # first 13 numeric features
        mapped = list(raw_shap[:n_num])
        # Sum OHE category SHAP values into type feature (idx 1 in feature_names = 'type')
        type_shap_sum = float(np.sum(raw_shap[n_num:])) if len(raw_shap) > n_num else 0.0
        
        # Insert type shap at index 1
        result = mapped[:1] + [type_shap_sum] + mapped[1:]
        return np.array(result[:len(feature_names)])
    
    return np.resize(raw_shap, len(feature_names))


def _heuristic_feature_attribution(
    model: Any,
    row_series: pd.Series,
    feature_names: List[str]
) -> np.ndarray:
    """Heuristic fallback feature attribution using feature importances."""
    feature_imps = getattr(model, "feature_importances_", None)
    if feature_imps is None or len(feature_imps) < len(feature_names):
        imps = np.ones(len(feature_names)) / len(feature_names)
    else:
        # Sum OHE type features back to type
        imps = _aggregate_transformed_shap_to_inputs(feature_imps, feature_names)

    # Direct signs based on domain risk signals
    signs = np.ones(len(feature_names))
    for i, name in enumerate(feature_names):
        if name in ("origin_balance_error", "destination_balance_error", "unusually_high_amount"):
            val = float(row_series.get(name, 0.0) or 0.0)
            signs[i] = 1.0 if val > 0 else -1.0
        elif name == "type":
            t_val = str(row_series.get("type", "")).upper()
            signs[i] = 1.0 if t_val in ("TRANSFER", "CASH_OUT") else -0.5

    return imps * signs

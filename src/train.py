"""Train reproducible PaySim fraud models without test-set leakage."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    precision_recall_curve,
    precision_recall_fscore_support,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from src.config import METRICS_PATH, MODEL_FEATURES, MODEL_PATH, RANDOM_STATE, TARGET
from src.data_preprocessing import load_dataset, validate_paysim
from src.features import engineer_features

MODEL_DISPLAY_NAMES = {
    "logistic_regression": "Logistic Regression",
    "decision_tree": "Decision Tree",
    "random_forest": "Random Forest",
    "hist_gradient_boosting": "Gradient Boosting",
}


def build_pipeline(model):
    categorical = ["type"]
    numerical = [
        c for c in MODEL_FEATURES if c not in categorical
    ] + [
        "log_amount", "origin_balance_change", "destination_balance_change",
        "origin_balance_error", "destination_balance_error",
        "amount_to_origin_balance", "unusually_high_amount",
    ]
    preprocessing = ColumnTransformer([
        ("numeric", Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
        ]), numerical),
        ("categorical", Pipeline([
            ("impute", SimpleImputer(strategy="most_frequent")),
            ("encode", OneHotEncoder(handle_unknown="ignore")),
        ]), categorical),
    ])
    return Pipeline([("preprocess", preprocessing), ("model", model)])


def metrics(y_true, scores, threshold=0.5):
    pred = (scores >= threshold).astype(int)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, pred, average="binary", zero_division=0
    )
    acc = accuracy_score(y_true, pred)
    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(roc_auc_score(y_true, scores)), 4),
        "pr_auc": round(float(average_precision_score(y_true, scores)), 4),
    }


def _sample_curve(x_arr, y_arr, n=100):
    """Downsample a curve to n points for JSON transport."""
    x = np.array(x_arr)
    y = np.array(y_arr)
    if len(x) <= n:
        return x.round(4).tolist(), y.round(4).tolist()
    idx = np.linspace(0, len(x) - 1, n, dtype=int)
    return x[idx].round(4).tolist(), y[idx].round(4).tolist()


def _get_feature_importances(pipeline, feature_names):
    """Extract feature importances from tree-based models."""
    model = pipeline.named_steps["model"]
    if hasattr(model, "feature_importances_"):
        raw = model.feature_importances_
        # Map to input feature names (preprocess expands categorical)
        # Use simplified names matching original feature_inputs
        n = min(len(raw), len(feature_names))
        return [
            {"feature": feature_names[i], "importance": round(float(raw[i]), 6)}
            for i in range(n)
        ]
    elif hasattr(model, "coef_"):
        coef = np.abs(model.coef_[0])
        n = min(len(coef), len(feature_names))
        total = coef[:n].sum() or 1
        return [
            {"feature": feature_names[i], "importance": round(float(coef[i] / total), 6)}
            for i in range(n)
        ]
    return [{"feature": f, "importance": 0.0} for f in feature_names]


def main(path: str):
    raw = load_dataset(path)
    errors = validate_paysim(raw, require_target=True)
    if errors:
        raise ValueError("Dataset validation failed: " + "; ".join(errors))
    
    data = engineer_features(raw)
    feature_inputs = MODEL_FEATURES + [
        "log_amount", "origin_balance_change", "destination_balance_change",
        "origin_balance_error", "destination_balance_error",
        "amount_to_origin_balance", "unusually_high_amount",
    ]
    
    X_train, X_test, y_train, y_test = train_test_split(
        data[feature_inputs], data[TARGET].astype(int),
        test_size=0.2, stratify=data[TARGET], random_state=RANDOM_STATE
    )
    
    candidates = {
        "logistic_regression": LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE
        ),
        "decision_tree": DecisionTreeClassifier(
            class_weight="balanced", min_samples_leaf=10, random_state=RANDOM_STATE
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=200, class_weight="balanced_subsample",
            n_jobs=-1, random_state=RANDOM_STATE
        ),
        "hist_gradient_boosting": HistGradientBoostingClassifier(
            random_state=RANDOM_STATE
        ),
    }
    
    results, fitted, scores_dict = {}, {}, {}
    for name, estimator in candidates.items():
        print(f"Training {name}...")
        pipeline = build_pipeline(estimator)
        pipeline.fit(X_train, y_train)
        scores = pipeline.predict_proba(X_test)[:, 1]
        results[name] = metrics(y_test, scores)
        fitted[name] = pipeline
        scores_dict[name] = scores
    
    winner = max(results, key=lambda n: (results[n]["pr_auc"], results[n]["recall"]))
    print(f"Selected model: {winner}")
    
    winner_scores = scores_dict[winner]
    training_date = datetime.now(timezone.utc).isoformat()
    
    # Confusion matrix
    pred = (winner_scores >= 0.5).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred, labels=[0, 1]).ravel()
    cm_data = {
        "true_negative": int(tn), "false_positive": int(fp),
        "false_negative": int(fn), "true_positive": int(tp),
    }
    
    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, winner_scores)
    roc_fpr, roc_tpr = _sample_curve(fpr, tpr)
    
    # PR curve
    prec, rec, _ = precision_recall_curve(y_test, winner_scores)
    pr_prec, pr_rec = _sample_curve(prec, rec)
    
    # Feature importances
    importances = _get_feature_importances(fitted[winner], feature_inputs)
    importances.sort(key=lambda x: x["importance"], reverse=True)
    
    # Transaction type fraud stats
    type_stats = {}
    if "type" in raw.columns:
        for tx_type in raw["type"].unique():
            mask = raw["type"] == tx_type
            sub = raw[mask]
            type_stats[tx_type] = {
                "count": int(len(sub)),
                "fraud_count": int(sub[TARGET].sum()),
                "fraud_rate": round(float(sub[TARGET].mean()), 6),
                "avg_amount": round(float(sub["amount"].mean()), 2),
            }
    
    # Step-based fraud trend (hourly buckets)
    if "step" in raw.columns:
        raw["step_bucket"] = (raw["step"] // 24).astype(int)  # daily
        trend = raw.groupby("step_bucket").agg(
            total=(TARGET, "count"),
            fraud=(TARGET, "sum"),
        ).reset_index()
        trend["fraud_rate"] = (trend["fraud"] / trend["total"]).round(4)
        fraud_trend = trend.to_dict(orient="records")
    else:
        fraud_trend = []
    
    artifact = {
        "pipeline": fitted[winner],
        "input_features": feature_inputs,
        "model_name": winner,
        "model_display_name": MODEL_DISPLAY_NAMES.get(winner, winner),
        "feature_names": feature_inputs,
        "version": "1.0",
        "training_date": training_date,
        "low_threshold": 0.30,
        "high_threshold": 0.70,
    }
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    
    report = {
        "dataset_rows": int(len(raw)),
        "fraud_count": int(raw[TARGET].sum()),
        "fraud_rate": round(float(raw[TARGET].mean()), 6),
        "avg_amount": round(float(raw["amount"].mean()), 2),
        "selected_model": winner,
        "model_display_name": MODEL_DISPLAY_NAMES.get(winner, winner),
        "model_version": "1.0",
        "training_date": training_date,
        "feature_names": feature_inputs,
        "metrics": results[winner],
        "model_comparison": results,
        "confusion_matrix": cm_data,
        "roc_curve": {"fpr": roc_fpr, "tpr": roc_tpr},
        "pr_curve": {"precision": pr_prec, "recall": pr_rec},
        "feature_importances": importances,
        "type_stats": type_stats,
        "fraud_trend": fraud_trend,
        "selection": "Highest PR-AUC, then recall.",
    }
    METRICS_PATH.parent.mkdir(exist_ok=True)
    METRICS_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in ("roc_curve", "pr_curve", "fraud_trend")}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", help="Path to PaySim CSV or Parquet dataset")
    main(parser.parse_args().dataset)

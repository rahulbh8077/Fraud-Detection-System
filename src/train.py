"""Train reproducible PaySim fraud models without test-set leakage."""
from __future__ import annotations

import argparse
import json

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, precision_recall_fscore_support, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from src.config import METRICS_PATH, MODEL_FEATURES, MODEL_PATH, RANDOM_STATE, TARGET
from src.data_preprocessing import load_dataset, validate_paysim
from src.features import engineer_features


def build_pipeline(model):
    categorical = ["type"]
    numerical = [c for c in MODEL_FEATURES if c not in categorical] + ["log_amount", "origin_balance_change", "destination_balance_change", "origin_balance_error", "destination_balance_error", "amount_to_origin_balance", "unusually_high_amount"]
    preprocessing = ColumnTransformer([
        ("numeric", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numerical),
        ("categorical", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), categorical),
    ])
    return Pipeline([("preprocess", preprocessing), ("model", model)])


def metrics(y_true, scores, threshold=.5):
    pred = (scores >= threshold).astype(int)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, pred, average="binary", zero_division=0)
    return {"precision": precision, "recall": recall, "f1": f1,
            "roc_auc": roc_auc_score(y_true, scores), "pr_auc": average_precision_score(y_true, scores)}


def main(path: str):
    raw = load_dataset(path)
    errors = validate_paysim(raw, require_target=True)
    if errors:
        raise ValueError("Dataset validation failed: " + "; ".join(errors))
    data = engineer_features(raw)
    X_train, X_test, y_train, y_test = train_test_split(data, data[TARGET].astype(int), test_size=.2, stratify=data[TARGET], random_state=RANDOM_STATE)
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE),
        "decision_tree": DecisionTreeClassifier(class_weight="balanced", min_samples_leaf=10, random_state=RANDOM_STATE),
        "random_forest": RandomForestClassifier(n_estimators=200, class_weight="balanced_subsample", n_jobs=-1, random_state=RANDOM_STATE),
        "hist_gradient_boosting": HistGradientBoostingClassifier(random_state=RANDOM_STATE),
    }
    results, fitted = {}, {}
    feature_inputs = MODEL_FEATURES + ["log_amount", "origin_balance_change", "destination_balance_change", "origin_balance_error", "destination_balance_error", "amount_to_origin_balance", "unusually_high_amount"]
    for name, estimator in candidates.items():
        pipeline = build_pipeline(estimator)
        pipeline.fit(X_train[feature_inputs], y_train)
        results[name] = metrics(y_test, pipeline.predict_proba(X_test[feature_inputs])[:, 1])
        fitted[name] = pipeline
    # PR-AUC is prioritized for severe class imbalance; tie-breaker is recall.
    winner = max(results, key=lambda name: (results[name]["pr_auc"], results[name]["recall"]))
    artifact = {"pipeline": fitted[winner], "input_features": feature_inputs, "model_name": winner,
                "version": "1.0", "low_threshold": .30, "high_threshold": .70}
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    report = {"dataset_rows": len(raw), "fraud_count": int(raw[TARGET].sum()), "fraud_rate": float(raw[TARGET].mean()),
              "selected_model": winner, "model_comparison": results, "selection": "Highest PR-AUC, then recall."}
    METRICS_PATH.parent.mkdir(exist_ok=True)
    METRICS_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", help="Path to PaySim CSV or Parquet dataset")
    main(parser.parse_args().dataset)

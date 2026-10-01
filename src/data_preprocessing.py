from __future__ import annotations

import numpy as np
import pandas as pd

from src.config import MODEL_FEATURES, TARGET, VALID_TYPES


def quality_report(frame: pd.DataFrame) -> dict:
    numeric = frame.select_dtypes(include="number")
    return {
        "rows": int(len(frame)), "columns": int(len(frame.columns)),
        "missing_values": {k: int(v) for k, v in frame.isna().sum().items() if v},
        "duplicate_rows": int(frame.duplicated().sum()),
        "infinite_values": int(np.isinf(numeric.to_numpy()).sum()) if not numeric.empty else 0,
        "negative_amounts": int((pd.to_numeric(frame.get("amount", pd.Series(dtype=float)), errors="coerce") < 0).sum()),
        "numerical_columns": numeric.columns.tolist(),
        "categorical_columns": frame.select_dtypes(exclude="number").columns.tolist(),
    }


def validate_paysim(frame: pd.DataFrame, require_target: bool = False) -> list[str]:
    required = list(MODEL_FEATURES) + ([TARGET] if require_target else [])
    errors = [f"Missing required column: {c}" for c in required if c not in frame.columns]
    if "amount" in frame and (pd.to_numeric(frame["amount"], errors="coerce") < 0).any():
        errors.append("Transaction amounts cannot be negative.")
    if "type" in frame:
        invalid = set(frame["type"].dropna().astype(str).str.upper()) - VALID_TYPES
        if invalid:
            errors.append(f"Invalid transaction types: {', '.join(sorted(invalid)[:5])}")
    return errors


def load_dataset(path: str) -> pd.DataFrame:
    return pd.read_parquet(path) if path.lower().endswith(".parquet") else pd.read_csv(path)

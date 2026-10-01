"""Generate a realistic synthetic PaySim-style dataset for demo/training.

This is SYNTHETIC DATA — clearly labeled — not real financial data.
Used only when no real PaySim dataset exists in data/raw/.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from pathlib import Path

RANDOM_STATE = 42
OUT_PATH = Path(__file__).resolve().parents[1] / "data" / "raw" / "demo_transactions.csv"

def generate(n_rows: int = 100_000, seed: int = RANDOM_STATE) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    types = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
    # Realistic fraud rates by type:
    # TRANSFER ~0.8%, CASH_OUT ~0.4%, others ~0%
    type_choices = rng.choice(types, size=n_rows, p=[0.22, 0.35, 0.05, 0.29, 0.09])
    amounts = np.exp(rng.normal(8.5, 1.8, n_rows)).clip(1, 10_000_000)
    old_org = np.exp(rng.normal(9.5, 2.0, n_rows)).clip(0, 50_000_000)
    
    # Some senders have 0 balance (important fraud signal)
    zero_balance_mask = rng.random(n_rows) < 0.15
    old_org[zero_balance_mask] = 0.0
    
    new_org = np.where(
        old_org >= amounts,
        old_org - amounts,
        np.maximum(old_org - amounts * rng.uniform(0.5, 1.0, n_rows), 0)
    )
    old_dest = np.exp(rng.normal(8.0, 2.5, n_rows)).clip(0, 100_000_000)
    new_dest = old_dest + amounts
    steps = rng.integers(1, 744, n_rows)  # ~31 days * 24 hours
    
    # Fraud generation logic (realistic patterns):
    is_fraud = np.zeros(n_rows, dtype=int)
    for i in range(n_rows):
        t = type_choices[i]
        if t in ("TRANSFER", "CASH_OUT"):
            # High amount + origin balance drops to 0 = strong fraud signal
            if amounts[i] > 200_000 and new_org[i] < 10:
                if rng.random() < 0.85:
                    is_fraud[i] = 1
                    new_org[i] = 0.0  # Balance completely drained
            elif amounts[i] > 100_000 and old_org[i] > 0 and (old_org[i] - amounts[i]) < 1:
                if rng.random() < 0.60:
                    is_fraud[i] = 1
                    new_org[i] = 0.0
            elif amounts[i] > 50_000 and rng.random() < 0.02:
                is_fraud[i] = 1
    
    df = pd.DataFrame({
        "step": steps,
        "type": type_choices,
        "amount": amounts.round(2),
        "nameOrig": [f"C{rng.integers(1e9, 9e9)}" for _ in range(n_rows)],
        "oldbalanceOrg": old_org.round(2),
        "newbalanceOrig": new_org.round(2),
        "nameDest": [f"C{rng.integers(1e9, 9e9)}" for _ in range(n_rows)],
        "oldbalanceDest": old_dest.round(2),
        "newbalanceDest": new_dest.round(2),
        "isFraud": is_fraud,
        "isFlaggedFraud": 0,
    })
    return df

if __name__ == "__main__":
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df = generate()
    fraud_count = df["isFraud"].sum()
    print(f"Generated {len(df):,} rows, {fraud_count:,} fraud ({fraud_count/len(df):.2%} rate)")
    df.to_csv(OUT_PATH, index=False)
    print(f"Saved to {OUT_PATH}")

from __future__ import annotations

import numpy as np
import pandas as pd


def engineer_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Create row-local features only; no target/future data is used."""
    data = frame.copy()
    amount = pd.to_numeric(data["amount"], errors="coerce")
    old_org = pd.to_numeric(data["oldbalanceOrg"], errors="coerce")
    new_org = pd.to_numeric(data["newbalanceOrig"], errors="coerce")
    old_dest = pd.to_numeric(data["oldbalanceDest"], errors="coerce")
    new_dest = pd.to_numeric(data["newbalanceDest"], errors="coerce")
    data["log_amount"] = np.log1p(amount.clip(lower=0))
    data["origin_balance_change"] = old_org - new_org
    data["destination_balance_change"] = new_dest - old_dest
    data["origin_balance_error"] = (old_org - amount - new_org).abs()
    data["destination_balance_error"] = (old_dest + amount - new_dest).abs()
    data["amount_to_origin_balance"] = amount / old_org.replace(0, np.nan)
    # Fixed rule keeps inference independent of the current test/upload batch.
    # Tune this domain threshold on training/validation data in a real deployment.
    data["unusually_high_amount"] = (amount >= 100000).astype(int)
    return data

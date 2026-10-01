"""Helpers for evaluation artifacts generated after training on real data."""
from __future__ import annotations

from sklearn.metrics import confusion_matrix


def fraud_confusion_matrix(y_true, probabilities, threshold: float = 0.5):
    """Return TN/FP/FN/TP; thresholds must be selected using validation costs."""
    predictions = (probabilities >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, predictions, labels=[0, 1]).ravel()
    return {"true_negative": int(tn), "false_positive": int(fp), "false_negative": int(fn), "true_positive": int(tp)}

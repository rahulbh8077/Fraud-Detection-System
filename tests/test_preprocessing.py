import pandas as pd

from src.data_preprocessing import quality_report, validate_paysim


def test_quality_report_counts_duplicates_and_missing():
    report = quality_report(pd.DataFrame({"amount": [1, 1], "type": ["PAYMENT", "PAYMENT"], "x": [None, None]}))
    assert report["duplicate_rows"] == 1
    assert report["missing_values"]["x"] == 2


def test_validation_rejects_negative_amount():
    assert any("negative" in error.lower() for error in validate_paysim(pd.DataFrame({"amount": [-1]})))

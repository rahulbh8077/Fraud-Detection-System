from src.predict import risk_label


def test_risk_thresholds_are_configurable():
    assert risk_label(.29) == ("LOW", "LEGITIMATE")
    assert risk_label(.30) == ("MEDIUM", "SUSPICIOUS")
    assert risk_label(.70) == ("HIGH", "FRAUDULENT")

from fastapi.testclient import TestClient

from app.main import app


def test_health_does_not_crash_without_model():
    response = TestClient(app).get("/health")
    assert response.status_code == 200


def test_invalid_transaction_is_rejected():
    response = TestClient(app).post("/predict", json={"step": 1, "type": "INVALID", "amount": -1})
    assert response.status_code == 422

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.dependencies.auth import get_current_user
from app.models.user import User


# Create a mock user for endpoint testing
mock_user = User(
    id="test-user-sms-id",
    name="Rudro Sharma",
    email="rudro@altrixlabs.com",
    role="patient",
    emergency_contact="+919876543210",
    is_active=True,
)


@pytest.fixture
def client():
    # Override auth dependency to return mock user
    app.dependency_overrides[get_current_user] = lambda: mock_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_get_sms_config(client):
    """Ensure safe SMS configuration endpoint works without auth and exposes provider state."""
    response = client.get("/api/v1/reminders/sms-config")
    assert response.status_code == 200
    data = response.json()
    assert "provider" in data
    assert "devMode" in data
    assert "isConfigured" in data
    # Ensure raw secret credentials are NEVER exposed
    assert "TWILIO_AUTH_TOKEN" not in data
    assert "TWILIO_ACCOUNT_SID" not in data


def test_create_and_send_sms_reminder(client):
    """Test full cycle: schedule reminder with SMS consent, send SMS in mock mode, and verify duplicate prevention."""
    # 1. Create reminder with SMS enabled and consent granted
    payload = {
        "medicationName": "Amlodipine 5mg",
        "strength": "5mg",
        "scheduledTime": "09:00 AM",
        "timingWithFood": "After breakfast",
        "slot": "morning",
        "dosage": "1 Tablet",
        "frequency": "Once daily",
        "phoneNumber": "+91 98765 43210",
        "recipientName": "Rudro Sharma",
        "smsEnabled": True,
        "smsConsent": True,
    }

    create_res = client.post("/api/v1/reminders", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    rem_id = created_data["id"]
    assert created_data["medicationName"] == "Amlodipine 5mg"
    assert created_data["dosage"] == "1 Tablet"
    assert created_data["smsStatus"] == "scheduled"
    assert created_data["smsConsent"] is True

    # 2. Dispatch SMS
    sms_res = client.post(f"/api/v1/reminders/{rem_id}/send-sms")
    assert sms_res.status_code == 200
    sms_data = sms_res.json()
    assert sms_data["success"] is True
    assert sms_data["smsStatus"] == "sent"
    assert "Amlodipine 5mg" in sms_data["smsBody"]
    assert "Rudro Sharma" in sms_data["smsBody"]
    assert sms_data["recipientMasked"].startswith("+91")
    assert "XXXXX" in sms_data["recipientMasked"]

    # 3. Attempt duplicate send (should prevent duplicate)
    dup_res = client.post(f"/api/v1/reminders/{rem_id}/send-sms")
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["success"] is False
    assert "already sent" in dup_data["message"].lower()

    # 4. Attempt force send (bypassing duplicate cooldown)
    force_res = client.post(f"/api/v1/reminders/{rem_id}/send-sms?force=true")
    assert force_res.status_code == 200
    assert force_res.json()["success"] is True


def test_reject_sms_without_consent(client):
    """Attempting to dispatch an SMS without patient consent must return HTTP 400."""
    payload = {
        "medicationName": "Atorvastatin 20mg",
        "strength": "20mg",
        "scheduledTime": "08:00 PM",
        "timingWithFood": "After dinner",
        "slot": "night",
        "dosage": "1 Tablet",
        "frequency": "Once daily at bedtime",
        "phoneNumber": "+91 98765 43210",
        "smsEnabled": True,
        "smsConsent": False,  # NO CONSENT
    }

    create_res = client.post("/api/v1/reminders", json=payload)
    assert create_res.status_code == 201
    rem_id = create_res.json()["id"]

    sms_res = client.post(f"/api/v1/reminders/{rem_id}/send-sms")
    assert sms_res.status_code == 400
    assert "consent" in sms_res.json()["detail"].lower()

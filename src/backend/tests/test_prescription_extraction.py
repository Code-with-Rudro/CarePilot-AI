import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.services.prescription_extraction_service import parse_clinical_prescription_text


mock_user = User(
    id="test-user-rx-id",
    name="Rudro Sharma",
    email="rudro@altrixlabs.com",
    role="patient",
    emergency_contact="+919876543210",
    is_active=True,
)


@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = lambda: mock_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_initial_prescriptions_empty(client):
    """Initially, prescriptions list must be empty (no sample/demo data)."""
    get_res = client.get("/api/v1/prescriptions")
    if get_res.status_code == 200:
        for rx in get_res.json():
            if rx.get("id"):
                client.delete(f"/api/v1/prescriptions/{rx['id']}")

    response = client.get("/api/v1/prescriptions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_parse_clinical_prescription_text_with_medicine():
    """Test OCR entity recognition parses medicine details and handles missing fields."""
    text = """
    City Health Center - Dr. Rajesh Gupta
    Date: 12-Oct-2026
    Diagnosis: Upper Respiratory Tract Infection
    
    Rx:
    1. Tab. Amoxicillin 500mg - 1 tablet twice daily after food x 5 days
    2. Tab. Paracetamol 650mg - 1 tablet as needed
    """
    parsed = parse_clinical_prescription_text(text)
    assert "Rajesh Gupta" in parsed["prescribed_by"]
    assert "12-Oct-2026" in parsed["prescribed_date"]
    assert "Upper Respiratory" in parsed["diagnosis"]
    assert len(parsed["medications"]) >= 2

    amox = next((m for m in parsed["medications"] if m["name"] == "Amoxicillin"), None)
    assert amox is not None
    assert amox["strength"] == "500mg"
    assert amox["dosage"] == "1 tablet"
    assert "twice daily" in amox["frequency"].lower()


def test_parse_clinical_prescription_unreadable_not_detected():
    """When a blurry or unreadable image is uploaded, unreadable fields must be 'Not detected'."""
    unreadable_text = "blurry_photo_unclear_scan_no_text"
    parsed = parse_clinical_prescription_text(unreadable_text)
    assert parsed["prescribed_by"] == "Not detected"
    assert parsed["prescribed_date"] == "Not detected"
    assert parsed["diagnosis"] == "Not detected"
    assert len(parsed["medications"]) == 1
    med = parsed["medications"][0]
    assert med["name"] == "Not detected"
    assert med["strength"] == "Not detected"
    assert med["dosage"] == "Not detected"
    assert med["confirmed"] is False


def test_upload_prescription_and_review(client):
    """Test full flow: uploading prescription image, extracting details, and patient reviewing/updating."""
    # 1. Upload prescription file
    file_content = b"Clinic Prescription - Dr. Meera Patel\nDate: 15-10-2026\nDx: Hypertension\nTab. Telmisartan 40mg 1 tablet once daily in the morning after food x 30 days"
    file = io.BytesIO(file_content)

    upload_res = client.post(
        "/api/v1/prescriptions/upload",
        files={"file": ("prescription_slip.jpg", file, "image/jpeg")},
    )
    assert upload_res.status_code == 201
    rx_data = upload_res.json()
    rx_id = rx_data["id"]
    assert "Meera Patel" in rx_data["prescribedBy"]
    assert len(rx_data["medications"]) >= 1

    med = rx_data["medications"][0]
    med_id = med["id"]
    assert med["name"] == "Telmisartan"
    assert med["strength"] == "40mg"
    assert med["confirmed"] is False

    # 2. Patient reviews and confirms medication
    update_res = client.patch(
        f"/api/v1/prescriptions/{rx_id}/medications/{med_id}",
        json={"confirmed": True, "dosage": "1 tablet (40mg)"},
    )
    assert update_res.status_code == 200
    updated_med = update_res.json()
    assert updated_med["confirmed"] is True
    assert updated_med["dosage"] == "1 tablet (40mg)"

    # 3. Clean up
    del_res = client.delete(f"/api/v1/prescriptions/{rx_id}")
    assert del_res.status_code == 200


def test_copilot_upload_and_extract(client):
    """Test copilot image upload and extraction endpoint returns structured chat message with citations."""
    file_content = b"Cardio Clinic - Dr. K. Srinivas\nDate: 11-10-2026\nDx: Hypertension\nTab. Metoprolol 25mg 1 tablet once daily morning after food x 30 days"
    file = io.BytesIO(file_content)

    upload_res = client.post(
        "/api/v1/copilot/upload-and-extract",
        files={"file": ("metoprolol_rx.jpg", file, "image/jpeg")},
        data={"prompt": "Please extract medicine instructions"}
    )
    assert upload_res.status_code == 201
    chat_data = upload_res.json()
    assert chat_data["role"] == "assistant"
    assert "Extraction" in chat_data["content"]
    assert "Metoprolol" in chat_data["content"]
    assert len(chat_data["citations"]) >= 1
    assert chat_data["citations"][0]["documentName"] == "metoprolol_rx.jpg"

    # Clean up created prescription
    get_res = client.get("/api/v1/prescriptions")
    if get_res.status_code == 200:
        for rx in get_res.json():
            client.delete(f"/api/v1/prescriptions/{rx['id']}")


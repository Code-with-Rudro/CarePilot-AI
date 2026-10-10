import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_auth_and_protected_routes(client):
    # 1. Register candidate user
    email = "integration_test_user@altrixlabs.ai"
    reg_payload = {
        "email": email,
        "password": "Password123!",
        "name": "Integration User",
        "role": "candidate"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [201, 400]  # 400 if already created in previous run

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!",
        "role": "candidate"
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Access /auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

    # 4. Unauthenticated access should be rejected
    unauth_res = client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

    # 5. Invalid token should be rejected
    bad_token_res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bad_invalid_token"})
    assert bad_token_res.status_code == 401


def test_documents_and_extractions_flow(client):
    # Login as seed user Rudro
    login_res = client.post("/api/v1/auth/login", json={
        "email": "rudro@altrixlabs.ai",
        "password": "carepilot123",
        "role": "candidate"
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get documents
    docs_res = client.get("/api/v1/documents", headers=headers)
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 1

    # Upload document
    pdf_bytes = b"%PDF-1.4 Mock Upload Test Document"
    files = {"file": ("test_upload.pdf", pdf_bytes, "application/pdf")}
    data = {"documentType": "lab_report", "facility": "Care Diagnostics"}
    upload_res = client.post("/api/v1/documents", headers=headers, files=files, data=data)
    assert upload_res.status_code == 201
    uploaded_doc = upload_res.json()
    assert uploaded_doc["filename"] == "test_upload.pdf"

    # Get extractions for this document
    ext_res = client.get(f"/api/v1/extractions?documentId={uploaded_doc['id']}", headers=headers)
    assert ext_res.status_code == 200
    extractions = ext_res.json()
    assert len(extractions) >= 1

    # Update extraction status
    patch_res = client.patch(
        f"/api/v1/extractions/{extractions[0]['id']}",
        headers=headers,
        json={"reviewStatus": "confirmed", "correctedValue": "30"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["reviewStatus"] == "confirmed"


def test_reminders_and_copilot_flow(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "rudro@altrixlabs.ai",
        "password": "carepilot123",
        "role": "candidate"
    })
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create reminder
    rem_payload = {
        "medicationName": "Amoxicillin",
        "strength": "500mg",
        "scheduledTime": "02:00 PM",
        "slot": "afternoon",
        "timingWithFood": "After lunch"
    }
    rem_res = client.post("/api/v1/reminders", headers=headers, json=rem_payload)
    assert rem_res.status_code == 201
    rem_id = rem_res.json()["id"]

    # 2. Patch reminder adherence
    patch_rem = client.patch(
        f"/api/v1/reminders/{rem_id}",
        headers=headers,
        json={"status": "taken", "takenAt": "02:05 PM"}
    )
    assert patch_rem.status_code == 200
    assert patch_rem.json()["status"] == "taken"

    # 3. Ask Copilot question
    chat_res = client.post(
        "/api/v1/copilot/chat",
        headers=headers,
        json={"question": "What is my haemoglobin count?"}
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "haemoglobin" in chat_data["content"].lower()
    assert len(chat_data["citations"]) >= 1
    assert chat_data["disclaimer"] is not None


def test_cross_user_isolation(client):
    """Verifies User B cannot access User A's private documents or extractions."""
    # Register and login User A
    user_a_email = "user_a_isolation@altrixlabs.ai"
    client.post("/api/v1/auth/register", json={
        "email": user_a_email, "password": "Password123!", "name": "User A", "role": "candidate"
    })
    token_a = client.post("/api/v1/auth/login", json={
        "email": user_a_email, "password": "Password123!", "role": "candidate"
    }).json()["token"]

    # Register and login User B
    user_b_email = "user_b_isolation@altrixlabs.ai"
    client.post("/api/v1/auth/register", json={
        "email": user_b_email, "password": "Password123!", "name": "User B", "role": "candidate"
    })
    token_b = client.post("/api/v1/auth/login", json={
        "email": user_b_email, "password": "Password123!", "role": "candidate"
    }).json()["token"]

    # User A uploads a private document
    pdf_bytes = b"%PDF-1.4 User A Confidential Report"
    files = {"file": ("user_a_confidential.pdf", pdf_bytes, "application/pdf")}
    upload_res = client.post(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {token_a}"},
        files=files,
        data={"documentType": "lab_report"}
    )
    assert upload_res.status_code == 201
    doc_a_id = upload_res.json()["id"]

    # User B attempts to access User A's document directly by ID
    unauth_doc_access = client.get(
        f"/api/v1/documents/{doc_a_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    # Must be 404 / access denied
    assert unauth_doc_access.status_code == 404

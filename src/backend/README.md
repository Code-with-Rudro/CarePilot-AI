# CarePilot AI — Backend API

**Organization:** Altrix Labs  
**Technology:** Python 3.12, FastAPI, SQLAlchemy, SQLite/PostgreSQL, Pydantic v2  
**Role:** AI-Powered Personal Health Copilot Backend & Medical Intelligence API  

---

## 1. Features & Architecture

* **Authentication & Authorization:** Secure registration, bcrypt password hashing, role-based access control (`candidate` / `patient`, `receptionist`, `clinician_reviewer`), JWT token issuance and verification, and session revocation.
* **Medical Documents & Storage:** Multipart uploads (PDF, PNG, JPEG), file size and MIME-type validation, isolated storage, and extraction job tracking.
* **Human-in-the-Loop Extractions:** Extracted clinical parameters (lab values, vitals, medications) with confidence scoring and unverified/confirmed review workflows.
* **Health Timeline & Facts:** Longitudinal clinical metrics, out-of-range indicators, and source document traceability.
* **Prescriptions & Reminders:** Prescriptions with bilingual (English & Telugu) instructions, user-controlled adherence tracking (`taken`, `skipped`, `snoozed`), and optional n8n webhook notifications.
* **Grounded Health Copilot (RAG):** User-scoped retrieval querying only the authenticated patient's records; answers include explicit document citations and safety disclaimers (non-diagnostic advisory).
* **Medicine & AR Catalog:** Verified drug lookup for packaging recognition and AR experiences.
* **Privacy & Compliance:** Data export and account deletion workflows, with zero cross-tenant data leakage.

---

## 2. Local Setup Instructions

### Prerequisites
* Python 3.11+ or 3.12+
* Node.js & npm (for frontend)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd src/backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local development values work out-of-the-box using SQLite (`carepilot.db`).

---

## 3. Running the Server

Start the FastAPI application with Uvicorn:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Once started:
* **Interactive API Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`
* **Alternative API Documentation (ReDoc):** `http://127.0.0.1:8000/redoc`
* **Health Check Endpoint:** `http://127.0.0.1:8000/health`

---

## 4. Default Seed Accounts

The backend automatically initializes tables and seeds demonstration accounts on first boot:

| Role | Email | Password | ABHA ID |
|---|---|---|---|
| **Candidate / Patient** | `rudro@altrixlabs.ai` | `carepilot123` | `91-4829-1029-4821` |
| **Hospital Receptionist** | `reception@carepilot.demo` | `carepilot123` | `91-0000-1111-2222` |
| **Clinician Reviewer** | `dr.srinivas@carepilot.demo` | `carepilot123` | `91-9999-8888-7777` |

---

## 5. Running Automated Tests

Run the test suite using pytest from the repository root:
```bash
python -m pytest tests/ -v
```

Tests cover:
* Password hashing and JWT generation/validation
* Registration, duplicate rejection, and role assignment
* Document upload validation and extraction pipeline
* Reminder lifecycle and adherence tracking
* Grounded Copilot Q&A with citations
* Strict cross-user data isolation (User B cannot access User A's records)

---

## 6. Frontend Integration

In the frontend repository (`src/frontend/`):
Ensure the API base URL points to the FastAPI backend:
```env
VITE_API_BASE_URL="http://127.0.0.1:8000/api/v1"
```
The frontend connects directly to `POST /api/v1/auth/login`, stores the JWT token in `sessionStorage`, and includes `Authorization: Bearer <token>` on all requests.

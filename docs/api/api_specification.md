# CarePilot AI — API Specification (v1)

**Base URL:** `/api/v1`  
**Authentication Scheme:** `Bearer <JWT_TOKEN>`  
**Transport Security:** HTTPS (production) / HTTP (local development)  

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new patient/candidate account.
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "Full Name",
    "role": "candidate",
    "abha_id": "91-1234-5678-9012"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Full Name",
      "role": "candidate",
      "abhaId": "91-1234-5678-9012"
    },
    "token_type": "bearer"
  }
  ```

### `POST /api/v1/auth/login`
Authenticates a user and issues a signed JWT access token.
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "role": "candidate"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Full Name",
      "role": "candidate"
    },
    "token_type": "bearer"
  }
  ```

### `POST /api/v1/auth/logout`
Terminates the authenticated session and writes an audit event.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):** `{"message": "Session successfully terminated.", "success": true}`

### `GET /api/v1/auth/me`
Retrieves current authenticated user's profile.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):** User profile object.

---

## 2. Document Endpoints

### `GET /api/v1/documents`
Lists all medical documents owned by the authenticated user.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):** Array of `MedicalDocument` objects.

### `GET /api/v1/documents/{document_id}`
Retrieves metadata for a specific document owned by the user.

### `POST /api/v1/documents`
Uploads a document (multipart/form-data).
* **Form Parameters:**
  * `file`: Binary file (PDF, PNG, JPEG, max 10MB)
  * `documentType`: `prescription` | `lab_report` | `discharge_summary` | `diagnostic` | `general`
  * `facility`: Optional clinic or laboratory name
* **Response (201 Created):** `MedicalDocument` object with initial extraction candidates.

---

## 3. Clinical Extraction Endpoints

### `GET /api/v1/extractions?documentId={id}`
Retrieves extracted clinical parameters, optionally filtered by document ID.
* **Response (200 OK):** Array of `ExtractedField` objects.

### `PATCH /api/v1/extractions/{field_id}`
Updates human verification status for an extracted entity.
* **Request Body:**
  ```json
  {
    "reviewStatus": "confirmed",
    "correctedValue": "32"
  }
  ```
* **Response (200 OK):** Updated `ExtractedField` object. Confirmed entities automatically propagate to `health_facts`.

---

## 4. Health Facts & Timeline Endpoints

### `GET /api/v1/health-facts`
Retrieves confirmed longitudinal health facts and diagnostic parameters.
* **Response (200 OK):** Array of `HealthFact` objects.

---

## 5. Prescriptions & Reminders Endpoints

### `GET /api/v1/prescriptions`
Retrieves prescriptions with bilingual medication instructions and warnings.

### `GET /api/v1/reminders`
Retrieves medication reminders for the authenticated user.

### `POST /api/v1/reminders`
Schedules a new medication reminder. Dispatches webhook to n8n if configured.
* **Request Body:**
  ```json
  {
    "medicationName": "Metoprolol",
    "strength": "25mg",
    "scheduledTime": "08:00 AM",
    "slot": "morning",
    "timingWithFood": "After breakfast"
  }
  ```

### `PATCH /api/v1/reminders/{reminder_id}`
Updates adherence status (`taken`, `skipped`, `snoozed`).

### `DELETE /api/v1/reminders/{reminder_id}`
Removes a medication reminder.

---

## 6. AI Health Copilot (RAG) Endpoints

### `POST /api/v1/copilot/chat`
Submits a health question grounded strictly in the authenticated user's records.
* **Request Body:**
  ```json
  {
    "question": "What is my haemoglobin count?",
    "conversationId": "optional-uuid"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "role": "assistant",
    "content": "Explanation grounded in records...",
    "timestamp": "08:30 PM",
    "citations": [
      {
        "documentId": "doc-001",
        "documentName": "Apollo_Complete_Blood_Count_Report.pdf",
        "page": 1,
        "snippet": "Haemoglobin: 11.2 g/dL"
      }
    ],
    "insufficientEvidence": false,
    "disclaimer": "This informational response is grounded in your uploaded records and does not replace a clinician evaluation."
  }
  ```

---

## 7. Medicine & AR Catalog Endpoints

### `GET /api/v1/medicine/lookup?query={name}`
Searches verified drug database for active ingredients, safety advisories, and Telugu summaries.

---

## 8. Privacy & Governance Endpoints

### `GET /api/v1/privacy/export`
Exports all records, facts, prescriptions, and reminders for the user.

### `DELETE /api/v1/privacy/data`
Permanently purges the authenticated user's account and associated medical records.

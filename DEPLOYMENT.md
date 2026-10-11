# CarePilot-AI Production Deployment Guide

This guide details the complete production Dockerization and cloud deployment procedure for **CarePilot-AI** (FastAPI backend + React Vite frontend + PostgreSQL database + Nginx reverse proxy + Clinical OCR).

---

## 1. Architecture Overview

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | SPA served through Nginx with client-side routing & reverse-proxy |
| **Backend** | FastAPI, Python 3.11, Uvicorn | Asynchronous REST API, JWT auth, OCR extraction, Twilio SMS |
| **Database** | PostgreSQL 16 (or SQLite) | Relational database with automatic schema migrations & seeding |
| **OCR Engine** | Tesseract OCR (Linux/Docker) / Windows Media OCR (Windows) | Cross-platform clinical prescription entity extraction |
| **Reverse Proxy** | Nginx Alpine | Serves frontend assets, gzip compression, proxies `/api/` to backend |

---

## 2. Quickstart: Local Docker Compose Deployment

### Prerequisites
- Docker Engine & Docker Compose (`docker compose version` >= 2.20)
- Git

### Steps:
1. **Clone & switch to the deployment branch:**
   ```bash
   git clone https://github.com/Code-with-Rudro/CarePilot-AI.git
   cd CarePilot-AI
   git checkout antigravity-work
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(Update `SECRET_KEY`, `POSTGRES_PASSWORD`, and optional Twilio / AI keys in `.env`)*

3. **Build and start all containers:**
   ```bash
   docker compose up --build -d
   ```

4. **Verify running containers:**
   ```bash
   docker compose ps
   ```
   You will see:
   - `carepilot-frontend` listening on `http://localhost:80` (and `http://localhost:3000`)
   - `carepilot-backend` listening on `http://localhost:8000`
   - `carepilot-db` healthy on port 5432 internally

5. **Run the Automated Healthcheck:**
   ```bash
   python infrastructure/monitoring/healthcheck.py
   ```

---

## 3. Public Cloud Deployment (Production HTTPS URL)

To make CarePilot-AI publicly accessible with automated HTTPS, we provide a turnkey Blueprint via **Render** (`render.yaml`).

### Option A: 1-Click Render Blueprint (Recommended)
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository: `Code-with-Rudro/CarePilot-AI` and select branch `antigravity-work`.
4. Render automatically parses `render.yaml` and provisions:
   - **PostgreSQL Database** (`carepilot-postgres-db` with persistent volume)
   - **Backend Web Service** (`carepilot-ai-backend` using `src/backend/Dockerfile`)
   - **Frontend Web Service** (`carepilot-ai-frontend` using `src/frontend/Dockerfile` & Nginx)
5. Under Environment variables, configure your production keys:
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
   - `MURF_API_KEY` (optional)
   - `TAVILY_API_KEY` (optional)
6. Click **Apply**.
7. Once deployed, Render provides:
   - **Public Frontend URL:** `https://carepilot-ai-frontend.onrender.com`
   - **Public Backend URL:** `https://carepilot-ai-backend.onrender.com`
   - **Public API Healthcheck:** `https://carepilot-ai-backend.onrender.com/health`

---

### Option B: Railway / Fly.io / AWS ECS / DigitalOcean

For any Docker-compatible cloud VPS or platform:
1. **Database:** Deploy PostgreSQL 16 (e.g. Supabase, Neon, or Railway Postgres).
2. **Backend:** Deploy `src/backend/Dockerfile` with:
   - `DATABASE_URL`: `postgresql://user:pass@host:5432/dbname`
   - `PORT`: `$PORT` (assigned by host)
   - `BACKEND_CORS_ORIGINS`: `["https://your-frontend-domain.com"]`
3. **Frontend:** Deploy `src/frontend/Dockerfile` with build argument:
   - `VITE_API_BASE_URL`: `https://your-backend-domain.com`

---

## 4. Database Persistence & Migrations

- In Docker Compose, PostgreSQL persists data inside named volume `carepilot_postgres_data`.
- In Render/managed Postgres, persistence is managed automatically by the provider's persistent block storage.
- On backend startup, `Base.metadata.create_all()` and `migrate_schema()` automatically execute to ensure all tables (`users`, `prescriptions`, `reminders`, `medical_documents`, `extracted_fields`, `health_facts`, `chat_messages`) and columns exist without data loss.

---

## 5. Verification Checklist

Run these commands to verify each layer of the application:

1. **Backend Health Check:**
   ```bash
   curl -f http://localhost:8000/health
   # Returns: {"status":"healthy","service":"CarePilot AI Backend","environment":"production","apiPrefix":"/api/v1"}
   ```

2. **API Documentation:**
   Open `http://localhost:8000/docs` in your browser.

3. **Frontend Health & UI:**
   Open `http://localhost` (or deployed HTTPS link). Verify:
   - Login page loads and authenticates.
   - Medical document upload & clinical OCR extraction work.
   - Prescription viewer displays extracted medicines and dosages.
   - Medication reminders page loads and SMS test dispatch succeeds.
   - Telugu language audio synthesis / TTS works.

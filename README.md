# CarePilot-AI

> AI-Powered Clinical Copilot & Patient Care Management Platform (Altrix Labs).

CarePilot-AI bridges patient engagement, clinical prescription OCR extraction, automated medication reminders (via Twilio SMS), multilingual Telugu voice synthesis, and clinical history tracking.

---

## Architecture

- **Frontend (`src/frontend`)**: React 18, Vite, TypeScript, Vanilla CSS, Lucide icons, multi-stage Docker build with Nginx reverse proxy.
- **Backend (`src/backend`)**: FastAPI, Python 3.11, SQLAlchemy 2.0, PostgreSQL / SQLite, Tesseract OCR & Windows Media OCR, Twilio SMS API.
- **Worker (`src/backend/app/workers`)**: Background polling for scheduled reminder dispatch and tasks.
- **Orchestration**: Docker Compose (`docker-compose.yml`) & Render Blueprint (`render.yaml`).

---

## Quickstart with Docker

To build and run the entire application stack:

```bash
# 1. Clone repository and switch to antigravity-work branch
git checkout antigravity-work

# 2. Configure environment variables
cp .env.example .env

# 3. Start all services in background
docker compose up --build -d

# 4. Check status and health
docker compose ps
python infrastructure/monitoring/healthcheck.py
```

- **Frontend**: [http://localhost](http://localhost) (or [http://localhost:3000](http://localhost:3000))
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Healthcheck Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

For full production deployment instructions, cloud hosting guides (Render, Railway, Fly.io), and persistent volume configurations, see [DEPLOYMENT.md](DEPLOYMENT.md).
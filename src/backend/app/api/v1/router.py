from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    copilot,
    documents,
    extractions,
    health_facts,
    medicine,
    prescriptions,
    privacy,
    reminders,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(documents.router, prefix="/documents", tags=["Medical Documents"])
api_router.include_router(extractions.router, prefix="/extractions", tags=["Clinical Extractions"])
api_router.include_router(health_facts.router, prefix="/health-facts", tags=["Health Facts & Timeline"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescriptions"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["Reminders"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["Health Copilot & RAG"])
api_router.include_router(medicine.router, prefix="/medicine", tags=["Medicine & AR Catalog"])
api_router.include_router(privacy.router, prefix="/privacy", tags=["Privacy & Compliance"])

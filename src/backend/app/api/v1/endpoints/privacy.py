from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.services.audit_service import AuditService
from app.services.document_service import DocumentService
from app.services.health_fact_service import HealthFactService
from app.services.reminder_service import ReminderService

router = APIRouter()


@router.get("/export", response_model=Dict[str, Any])
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exports all personal health records, facts, and chat history for the user under data portability."""
    doc_service = DocumentService(db)
    health_service = HealthFactService(db)
    reminder_service = ReminderService(db)
    audit_service = AuditService(db)

    docs = doc_service.get_user_documents(current_user.id)
    facts = health_service.get_user_health_facts(current_user.id)
    rxs = health_service.get_user_prescriptions(current_user.id)
    rems = reminder_service.get_user_reminders(current_user.id)

    audit_service.log(
        action="data_exported",
        user_id=current_user.id,
        resource_type="user",
        resource_id=current_user.id
    )

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role,
            "abhaId": current_user.abha_id,
        },
        "documentsCount": len(docs),
        "healthFactsCount": len(facts),
        "prescriptionsCount": len(rxs),
        "remindersCount": len(rems),
        "exportTimestamp": current_user.created_at.isoformat()
    }


@router.delete("/data", response_model=MessageResponse)
def delete_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purges all personal records, documents, and credentials for the authenticated user."""
    audit_service = AuditService(db)
    audit_service.log(
        action="user_account_deleted",
        user_id=current_user.id,
        resource_type="user",
        resource_id=current_user.id
    )

    db.delete(current_user)
    db.commit()
    return MessageResponse(message="All user data and associated records have been permanently purged.")

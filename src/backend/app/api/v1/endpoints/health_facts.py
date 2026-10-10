from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.extracted_field import HealthFactResponse
from app.services.health_fact_service import HealthFactService

router = APIRouter()


@router.get("", response_model=List[HealthFactResponse])
@router.get("/", response_model=List[HealthFactResponse])
def get_health_facts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves verified health facts and diagnostic parameters for the user's timeline."""
    service = HealthFactService(db)
    facts = service.get_user_health_facts(current_user.id)
    return [
        HealthFactResponse(
            id=f.id,
            user_id=f.user_id,
            category=f.category,
            test_name=f.test_name,
            value=f.value,
            unit=f.unit,
            reference_range=f.reference_range,
            is_out_of_range=f.is_out_of_range,
            observed_date=f.observed_date,
            source_document_id=f.source_document_id,
            source_document_name=f.source_document_name
        )
        for f in facts
    ]

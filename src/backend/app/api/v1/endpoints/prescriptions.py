import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.prescription import MedicationInstructionResponse, PrescriptionResponse
from app.services.health_fact_service import HealthFactService

router = APIRouter()


@router.get("", response_model=List[PrescriptionResponse])
@router.get("/", response_model=List[PrescriptionResponse])
def get_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all active prescriptions and medication instructions for the user."""
    service = HealthFactService(db)
    rxs = service.get_user_prescriptions(current_user.id)
    results = []
    for rx in rxs:
        meds = []
        for m in rx.medications:
            warnings = json.loads(m.warnings_json) if m.warnings_json else []
            meds.append(
                MedicationInstructionResponse(
                    id=m.id,
                    name=m.name,
                    strength=m.strength,
                    dosage=m.dosage,
                    route=m.route,
                    frequency=m.frequency,
                    timing=m.timing,
                    duration=m.duration,
                    instructions_english=m.instructions_english,
                    instructions_telugu=m.instructions_telugu,
                    confidence=m.confidence,
                    confirmed=m.confirmed,
                    warnings=warnings
                )
            )
        results.append(
            PrescriptionResponse(
                id=rx.id,
                document_id=rx.document_id,
                prescribed_by=rx.prescribed_by,
                prescribed_date=rx.prescribed_date,
                diagnosis=rx.diagnosis,
                status=rx.status,
                medications=meds
            )
        )
    return results

import json
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.document import Document
from app.models.prescription import MedicationInstruction, Prescription
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.prescription import (
    MedicationInstructionResponse,
    MedicationInstructionUpdate,
    PrescriptionResponse,
)
from app.services.audit_service import AuditService
from app.services.health_fact_service import HealthFactService
from app.services.prescription_extraction_service import PrescriptionExtractionService

router = APIRouter()


def _to_rx_response(rx: Prescription) -> PrescriptionResponse:
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
                instructions_hindi=None,
                confidence=m.confidence,
                confirmed=m.confirmed,
                warnings=warnings,
            )
        )
    return PrescriptionResponse(
        id=rx.id,
        document_id=rx.document_id,
        prescribed_by=rx.prescribed_by,
        prescribed_date=rx.prescribed_date,
        diagnosis=rx.diagnosis,
        status=rx.status,
        medications=meds,
    )


@router.get("", response_model=List[PrescriptionResponse])
@router.get("/", response_model=List[PrescriptionResponse])
def get_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all active prescriptions and medication instructions for the user."""
    service = HealthFactService(db)
    rxs = service.get_user_prescriptions(current_user.id)
    return [_to_rx_response(rx) for rx in rxs]


@router.post("/upload", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def upload_prescription_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Uploads a prescription image and runs OCR & clinical entity extraction.

    Extracts actual medicine names, dosages, timings, and instructions from the image.
    Unreadable or missing fields are returned as 'Not detected'.
    """
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    service = PrescriptionExtractionService(db)
    audit_service = AuditService(db)

    rx = await service.extract_and_create_prescription(
        file_content=content,
        filename=file.filename or "prescription_scan.jpg",
        user_id=current_user.id,
        content_type=file.content_type or "image/jpeg",
    )

    audit_service.log(
        action="prescription_uploaded_and_extracted",
        user_id=current_user.id,
        resource_type="prescription",
        resource_id=rx.id,
        details=f"Extracted {len(rx.medications)} medication entries from {file.filename}",
    )

    return _to_rx_response(rx)


@router.patch("/{prescription_id}/medications/{med_id}", response_model=MedicationInstructionResponse)
def update_medication_instruction(
    prescription_id: str,
    med_id: str,
    update_data: MedicationInstructionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows patient to review, confirm, or correct unreadable or detected medication details."""
    rx = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.user_id == current_user.id,
    ).first()
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")

    med = db.query(MedicationInstruction).filter(
        MedicationInstruction.id == med_id,
        MedicationInstruction.prescription_id == prescription_id,
    ).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found.")

    if update_data.name is not None:
        med.name = update_data.name
    if update_data.strength is not None:
        med.strength = update_data.strength
    if update_data.dosage is not None:
        med.dosage = update_data.dosage
    if update_data.frequency is not None:
        med.frequency = update_data.frequency
    if update_data.timing is not None:
        med.timing = update_data.timing
    if update_data.duration is not None:
        med.duration = update_data.duration
    if update_data.confirmed is not None:
        med.confirmed = update_data.confirmed

    db.commit()
    db.refresh(med)

    warnings = json.loads(med.warnings_json) if med.warnings_json else []
    return MedicationInstructionResponse(
        id=med.id,
        name=med.name,
        strength=med.strength,
        dosage=med.dosage,
        route=med.route,
        frequency=med.frequency,
        timing=med.timing,
        duration=med.duration,
        instructions_english=med.instructions_english,
        instructions_telugu=med.instructions_telugu,
        instructions_hindi=None,
        confidence=med.confidence,
        confirmed=med.confirmed,
        warnings=warnings,
    )


@router.delete("/{prescription_id}", response_model=MessageResponse)
def delete_prescription(
    prescription_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes an uploaded prescription."""
    rx = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.user_id == current_user.id,
    ).first()
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")

    doc_id = rx.document_id

    # Audit logging
    audit_service = AuditService(db)
    audit_service.log(
        action="prescription_deleted",
        user_id=current_user.id,
        resource_type="prescription",
        resource_id=rx.id,
        details=f"Deleted prescription from {rx.prescribed_by} ({rx.prescribed_date})",
    )

    db.delete(rx)
    db.flush()

    # Safely clean up associated prescription document if no other prescription references it
    if doc_id:
        other_rx = db.query(Prescription).filter(Prescription.document_id == doc_id).first()
        if not other_rx:
            doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
            if doc and doc.document_type == "prescription":
                if doc.file_path and os.path.exists(doc.file_path):
                    try:
                        os.remove(doc.file_path)
                    except OSError:
                        pass
                db.delete(doc)

    db.commit()
    return MessageResponse(message="Prescription deleted successfully.")


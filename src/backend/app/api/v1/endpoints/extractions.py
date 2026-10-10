from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.extracted_field import ExtractedFieldResponse, ExtractedFieldUpdate
from app.services.audit_service import AuditService
from app.services.extraction_service import ExtractionService

router = APIRouter()


@router.get("", response_model=List[ExtractedFieldResponse])
@router.get("/", response_model=List[ExtractedFieldResponse])
def get_extractions(
    documentId: Optional[str] = Query(None, alias="documentId"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves extracted clinical entities belonging to the user, optionally filtered by documentId."""
    extraction_service = ExtractionService(db)
    fields = extraction_service.get_extractions(current_user.id, documentId)
    return [
        ExtractedFieldResponse(
            id=f.id,
            document_id=f.document_id,
            category=f.category,
            field_name=f.field_name,
            field_value=f.field_value,
            normalized_value=f.normalized_value,
            unit=f.unit,
            reference_range=f.reference_range,
            is_abnormal=f.is_abnormal,
            confidence=f.confidence,
            page_number=f.page_number,
            source_snippet=f.source_snippet,
            review_status=f.review_status
        )
        for f in fields
    ]


@router.patch("/{field_id}", response_model=ExtractedFieldResponse)
def update_extracted_field(
    field_id: str,
    update_data: ExtractedFieldUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the verification status of an extracted field, propagating confirmed values to health facts."""
    extraction_service = ExtractionService(db)
    audit_service = AuditService(db)

    updated = extraction_service.update_field(
        field_id=field_id,
        user_id=current_user.id,
        review_status=update_data.reviewStatus,
        corrected_value=update_data.correctedValue
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extracted field not found or unauthorized."
        )

    audit_service.log(
        action="extraction_reviewed",
        user_id=current_user.id,
        resource_type="extracted_field",
        resource_id=field_id,
        details=f"Status set to {update_data.reviewStatus}"
    )

    return ExtractedFieldResponse(
        id=updated.id,
        document_id=updated.document_id,
        category=updated.category,
        field_name=updated.field_name,
        field_value=updated.field_value,
        normalized_value=updated.normalized_value,
        unit=updated.unit,
        reference_range=updated.reference_range,
        is_abnormal=updated.is_abnormal,
        confidence=updated.confidence,
        page_number=updated.page_number,
        source_snippet=updated.source_snippet,
        review_status=updated.review_status
    )

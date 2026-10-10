from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.document import MedicalDocumentResponse
from app.services.audit_service import AuditService
from app.services.document_service import DocumentService

router = APIRouter()


def _to_doc_response(doc, db: Session) -> MedicalDocumentResponse:
    from app.models.extracted_field import ExtractedField
    fields = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).all()
    unverified = sum(1 for f in fields if f.review_status == "unverified")
    return MedicalDocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        document_type=doc.document_type,
        upload_date=doc.upload_date,
        document_date=doc.document_date,
        facility_or_doctor=doc.facility_or_doctor,
        status=doc.status,
        summary=doc.summary,
        extracted_fields_count=len(fields),
        unverified_fields_count=unverified,
        page_count=doc.page_count,
        file_url=None
    )


@router.get("", response_model=List[MedicalDocumentResponse])
@router.get("/", response_model=List[MedicalDocumentResponse])
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all documents belonging to the authenticated user."""
    doc_service = DocumentService(db)
    docs = doc_service.get_user_documents(current_user.id)
    return [_to_doc_response(d, db) for d in docs]


@router.get("/{document_id}", response_model=MedicalDocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves metadata for a specific document owned by the user."""
    doc_service = DocumentService(db)
    doc = doc_service.get_document_by_id(document_id, current_user.id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied."
        )
    return _to_doc_response(doc, db)


@router.post("", response_model=MedicalDocumentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MedicalDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form("general"),
    facility: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Uploads a new medical document, validates file integrity, and triggers extraction."""
    doc_service = DocumentService(db)
    audit_service = AuditService(db)
    try:
        saved_doc = await doc_service.save_upload(
            file=file,
            user_id=current_user.id,
            document_type=documentType,
            facility=facility
        )
        audit_service.log(
            action="document_uploaded",
            user_id=current_user.id,
            resource_type="document",
            resource_id=saved_doc.id,
            details=f"Uploaded file: {saved_doc.filename} ({saved_doc.file_size} bytes)"
        )
        return _to_doc_response(saved_doc, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

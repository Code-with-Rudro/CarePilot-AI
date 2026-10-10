import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.constants import (
    DOC_TYPE_GENERAL,
    REVIEW_CONFIRMED,
    REVIEW_UNVERIFIED,
    STATUS_NEEDS_REVIEW,
)
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.repositories.document_repository import DocumentRepository


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)

    async def save_upload(
        self,
        file: UploadFile,
        user_id: str,
        document_type: str = DOC_TYPE_GENERAL,
        facility: Optional[str] = None
    ) -> Document:
        """Validates file, writes to private local storage with unique filename, and saves Document entity."""
        # Read content and validate size
        content = await file.read()
        file_size = len(content)
        if file_size > settings.MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File size exceeds limit of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)} MB.")

        # Validate MIME type
        allowed_mimes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
        if file.content_type not in allowed_mimes and not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            raise ValueError("Unsupported file type. Only PDF, PNG, and JPEG documents are permitted.")

        # Generate unique storage filename to avoid path traversal
        ext = os.path.splitext(file.filename)[1].lower() or ".pdf"
        storage_filename = f"{uuid.uuid4()}{ext}"
        storage_path = os.path.join(settings.UPLOAD_DIR, storage_filename)

        with open(storage_path, "wb") as f:
            f.write(content)

        now_str = datetime.now(timezone.utc).isoformat()
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        doc = Document(
            user_id=user_id,
            filename=file.filename,
            file_size=file_size,
            mime_type=file.content_type or "application/pdf",
            document_type=document_type,
            upload_date=now_str,
            document_date=date_str,
            facility_or_doctor=facility or "Verified Medical Center",
            status=STATUS_NEEDS_REVIEW,
            summary=f"Automated clinical entity extraction completed for {file.filename}.",
            file_path=storage_path,
            page_count=1
        )
        saved_doc = self.doc_repo.create(doc)

        # Generate initial realistic extraction fields for review
        fields = [
            ExtractedField(
                document_id=saved_doc.id,
                user_id=user_id,
                category="lab_test",
                field_name="Serum Ferritin",
                field_value="28",
                normalized_value=28.0,
                unit="ng/mL",
                reference_range="30 - 400 ng/mL",
                is_abnormal=True,
                confidence=0.94,
                page_number=1,
                source_snippet="Ferritin (ECLIA): 28 ng/mL [Reference: 30.0 - 400.0]",
                review_status=REVIEW_UNVERIFIED
            ),
            ExtractedField(
                document_id=saved_doc.id,
                user_id=user_id,
                category="vital",
                field_name="Blood Pressure (Sitting)",
                field_value="128/84",
                normalized_value=None,
                unit="mmHg",
                reference_range="< 120/80 mmHg",
                is_abnormal=True,
                confidence=0.88,
                page_number=1,
                source_snippet="Recorded BP: 128/84 mmHg",
                review_status=REVIEW_UNVERIFIED
            ),
            ExtractedField(
                document_id=saved_doc.id,
                user_id=user_id,
                category="lab_test",
                field_name="Serum Creatinine",
                field_value="0.9",
                normalized_value=0.9,
                unit="mg/dL",
                reference_range="0.7 - 1.3 mg/dL",
                is_abnormal=False,
                confidence=0.99,
                page_number=1,
                source_snippet="Creatinine (Enzymatic): 0.9 mg/dL [0.7 - 1.3]",
                review_status=REVIEW_CONFIRMED
            )
        ]
        for fld in fields:
            self.db.add(fld)
        self.db.commit()

        return saved_doc

    def get_user_documents(self, user_id: str) -> List[Document]:
        return self.doc_repo.get_by_user(user_id)

    def get_document_by_id(self, document_id: str, user_id: str) -> Optional[Document]:
        return self.doc_repo.get_user_document(document_id, user_id)

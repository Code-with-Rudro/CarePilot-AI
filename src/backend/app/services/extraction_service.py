from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.constants import REVIEW_CONFIRMED, REVIEW_CORRECTED
from app.models.extracted_field import ExtractedField, HealthFact
from app.repositories.document_repository import DocumentRepository
from app.repositories.health_fact_repository import HealthFactRepository


class ExtractionService:
    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.fact_repo = HealthFactRepository(db)

    def get_extractions(self, user_id: str, document_id: Optional[str] = None) -> List[ExtractedField]:
        if document_id:
            return self.doc_repo.get_extractions(document_id, user_id)
        return self.doc_repo.get_all_user_extractions(user_id)

    def update_field(
        self,
        field_id: str,
        user_id: str,
        review_status: str,
        corrected_value: Optional[str] = None
    ) -> Optional[ExtractedField]:
        field = self.doc_repo.get_extracted_field(field_id, user_id)
        if not field:
            return None

        field.review_status = review_status
        if corrected_value is not None:
            field.field_value = corrected_value
            try:
                field.normalized_value = float(corrected_value)
            except (ValueError, TypeError):
                pass

        # If confirmed or corrected, sync to HealthFacts
        if review_status in [REVIEW_CONFIRMED, REVIEW_CORRECTED]:
            try:
                numeric_val = float(field.field_value)
                doc = self.doc_repo.get_user_document(field.document_id, user_id)
                doc_name = doc.filename if doc else "Uploaded Document"

                fact = HealthFact(
                    user_id=user_id,
                    category="Diagnostic Lab" if field.category == "lab_test" else "Health Metric",
                    test_name=field.field_name,
                    value=numeric_val,
                    unit=field.unit or "",
                    reference_range=field.reference_range or "Standard",
                    is_out_of_range=field.is_abnormal,
                    observed_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    source_document_id=field.document_id,
                    source_document_name=doc_name
                )
                self.fact_repo.create(fact)
            except (ValueError, TypeError):
                pass

        self.db.commit()
        self.db.refresh(field)
        return field

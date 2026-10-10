from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.repositories.base_repository import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: Session):
        super().__init__(Document, db)

    def get_by_user(self, user_id: str) -> List[Document]:
        return self.db.query(Document).filter(Document.user_id == user_id).order_by(Document.created_at.desc()).all()

    def get_user_document(self, document_id: str, user_id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()

    def get_extractions(self, document_id: str, user_id: str) -> List[ExtractedField]:
        return (
            self.db.query(ExtractedField)
            .filter(ExtractedField.document_id == document_id, ExtractedField.user_id == user_id)
            .all()
        )

    def get_all_user_extractions(self, user_id: str) -> List[ExtractedField]:
        return self.db.query(ExtractedField).filter(ExtractedField.user_id == user_id).all()

    def get_extracted_field(self, field_id: str, user_id: str) -> Optional[ExtractedField]:
        return (
            self.db.query(ExtractedField)
            .filter(ExtractedField.id == field_id, ExtractedField.user_id == user_id)
            .first()
        )

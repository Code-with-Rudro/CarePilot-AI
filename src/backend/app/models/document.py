import uuid
from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    mime_type = Column(String(100), nullable=False, default="application/pdf")
    document_type = Column(String(50), nullable=False, default="general")
    upload_date = Column(String(50), nullable=False)
    document_date = Column(String(50), nullable=True)
    facility_or_doctor = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="uploaded")
    summary = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    page_count = Column(Integer, nullable=False, default=1)

    # Relationships
    user = relationship("User", back_populates="documents")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="document", cascade="all, delete-orphan")

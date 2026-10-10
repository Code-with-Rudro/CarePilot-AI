import uuid
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class ExtractedField(Base, TimestampMixin):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="lab_test")
    field_name = Column(String(255), nullable=False)
    field_value = Column(String(255), nullable=False)
    normalized_value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    is_abnormal = Column(Boolean, nullable=False, default=False)
    confidence = Column(Float, nullable=False, default=1.0)
    page_number = Column(Integer, nullable=False, default=1)
    source_snippet = Column(Text, nullable=True)
    review_status = Column(String(50), nullable=False, default="unverified")

    # Relationships
    document = relationship("Document", back_populates="extracted_fields")


class HealthFact(Base, TimestampMixin):
    __tablename__ = "health_facts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="Diagnostic Lab")
    test_name = Column(String(255), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    reference_range = Column(String(100), nullable=True)
    is_out_of_range = Column(Boolean, nullable=False, default=False)
    observed_date = Column(String(50), nullable=False)
    source_document_id = Column(String(36), nullable=True)
    source_document_name = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="health_facts")

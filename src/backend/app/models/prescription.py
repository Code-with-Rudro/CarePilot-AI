import uuid
from sqlalchemy import Boolean, Column, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prescribed_by = Column(String(255), nullable=False)
    prescribed_date = Column(String(50), nullable=False)
    diagnosis = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="active")

    # Relationships
    user = relationship("User", back_populates="prescriptions")
    document = relationship("Document", back_populates="prescriptions")
    medications = relationship("MedicationInstruction", back_populates="prescription", cascade="all, delete-orphan")


class MedicationInstruction(Base, TimestampMixin):
    __tablename__ = "medication_instructions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prescription_id = Column(String(36), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    strength = Column(String(50), nullable=False)
    dosage = Column(String(100), nullable=False)
    route = Column(String(50), nullable=False, default="Oral")
    frequency = Column(String(100), nullable=False)
    timing = Column(String(100), nullable=False)
    duration = Column(String(100), nullable=False)
    instructions_english = Column(Text, nullable=False)
    instructions_telugu = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False, default=1.0)
    confirmed = Column(Boolean, nullable=False, default=False)
    warnings_json = Column(Text, nullable=True)  # JSON-encoded string list

    # Relationships
    prescription = relationship("Prescription", back_populates="medications")

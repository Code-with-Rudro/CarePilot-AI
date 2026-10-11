import uuid
from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class Reminder(Base, TimestampMixin):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_name = Column(String(255), nullable=False)
    strength = Column(String(50), nullable=False)
    scheduled_time = Column(String(50), nullable=False)
    slot = Column(String(50), nullable=False, default="morning")
    timing_with_food = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    taken_at = Column(String(50), nullable=True)

    # SMS Configuration & Tracking
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True, default="Once daily")
    phone_number = Column(String(50), nullable=True)
    recipient_name = Column(String(255), nullable=True)
    sms_enabled = Column(Boolean, default=True, nullable=False)
    sms_consent = Column(Boolean, default=False, nullable=False)
    sms_status = Column(String(50), default="scheduled", nullable=False)  # "scheduled", "sent", "failed"
    sms_sent_at = Column(String(50), nullable=True)
    sms_error = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="reminders")

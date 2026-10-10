import uuid
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="candidate")
    abha_id = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    avatar = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    health_facts = relationship("HealthFact", back_populates="user", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "candidate"
    abhaId: Optional[str] = Field(None, validation_alias="abha_id")
    age: Optional[int] = None
    gender: Optional[str] = None
    bloodGroup: Optional[str] = Field(None, validation_alias="blood_group")
    emergencyContact: Optional[str] = Field(None, validation_alias="emergency_contact")
    avatar: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)
    role: Optional[str] = "candidate"
    abha_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, validation_alias="emergencyContact")
    abha_id: Optional[str] = Field(None, validation_alias="abhaId")
    blood_group: Optional[str] = Field(None, validation_alias="bloodGroup")
    age: Optional[int] = None
    gender: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "candidate"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    abhaId: Optional[str] = Field(None, validation_alias="abha_id")
    age: Optional[int] = None
    gender: Optional[str] = None
    bloodGroup: Optional[str] = Field(None, validation_alias="blood_group")
    emergencyContact: Optional[str] = Field(None, validation_alias="emergency_contact")
    avatar: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class TokenResponse(BaseModel):
    token: str
    user: UserResponse
    token_type: str = "bearer"

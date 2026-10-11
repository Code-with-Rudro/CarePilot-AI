from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicationInstructionUpdate(BaseModel):
    name: Optional[str] = None
    strength: Optional[str] = None
    dosage: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    duration: Optional[str] = None
    confirmed: Optional[bool] = None


class MedicationInstructionResponse(BaseModel):
    id: str
    name: str
    strength: str
    dosage: str
    route: str
    frequency: str
    timing: str
    duration: str
    instructionsEnglish: str = Field(..., validation_alias="instructions_english")
    instructionsTelugu: Optional[str] = Field(None, validation_alias="instructions_telugu")
    instructionsHindi: Optional[str] = Field(None, validation_alias="instructions_hindi")
    confidence: float
    confirmed: bool
    warnings: Optional[List[str]] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class PrescriptionResponse(BaseModel):
    id: str
    documentId: Optional[str] = Field(None, validation_alias="document_id")
    prescribedBy: str = Field(..., validation_alias="prescribed_by")
    prescribedDate: str = Field(..., validation_alias="prescribed_date")
    diagnosis: Optional[str] = None
    status: str
    medications: List[MedicationInstructionResponse]

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

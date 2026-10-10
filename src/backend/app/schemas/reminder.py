from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ReminderCreate(BaseModel):
    medicationName: str = Field(..., validation_alias="medication_name")
    strength: str
    scheduledTime: str = Field(..., validation_alias="scheduled_time")
    slot: Optional[str] = "morning"
    timingWithFood: str = Field(..., validation_alias="timing_with_food")

    model_config = ConfigDict(populate_by_name=True)


class ReminderUpdate(BaseModel):
    status: str
    takenAt: Optional[str] = Field(None, validation_alias="taken_at")

    model_config = ConfigDict(populate_by_name=True)


class ReminderResponse(BaseModel):
    id: str
    medicationName: str = Field(..., validation_alias="medication_name")
    strength: str
    scheduledTime: str = Field(..., validation_alias="scheduled_time")
    slot: str
    timingWithFood: str = Field(..., validation_alias="timing_with_food")
    status: str
    takenAt: Optional[str] = Field(None, validation_alias="taken_at")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

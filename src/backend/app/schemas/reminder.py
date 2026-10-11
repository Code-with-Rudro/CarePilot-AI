from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ReminderCreate(BaseModel):
    medicationName: str = Field(..., validation_alias="medication_name")
    strength: str
    scheduledTime: str = Field(..., validation_alias="scheduled_time")
    slot: Optional[str] = "morning"
    timingWithFood: str = Field(..., validation_alias="timing_with_food")

    # SMS Configuration Fields
    dosage: Optional[str] = None
    frequency: Optional[str] = "Once daily"
    phoneNumber: Optional[str] = Field(None, validation_alias="phone_number")
    recipientName: Optional[str] = Field(None, validation_alias="recipient_name")
    smsEnabled: bool = Field(True, validation_alias="sms_enabled")
    smsConsent: bool = Field(False, validation_alias="sms_consent")

    model_config = ConfigDict(populate_by_name=True)


class ReminderUpdate(BaseModel):
    status: Optional[str] = None
    takenAt: Optional[str] = Field(None, validation_alias="taken_at")

    # SMS Configuration Updates
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    phoneNumber: Optional[str] = Field(None, validation_alias="phone_number")
    recipientName: Optional[str] = Field(None, validation_alias="recipient_name")
    smsEnabled: Optional[bool] = Field(None, validation_alias="sms_enabled")
    smsConsent: Optional[bool] = Field(None, validation_alias="sms_consent")
    smsStatus: Optional[str] = Field(None, validation_alias="sms_status")

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

    # SMS fields
    dosage: Optional[str] = None
    frequency: Optional[str] = "Once daily"
    phoneNumber: Optional[str] = Field(None, validation_alias="phone_number")
    recipientName: Optional[str] = Field(None, validation_alias="recipient_name")
    smsEnabled: bool = Field(True, validation_alias="sms_enabled")
    smsConsent: bool = Field(False, validation_alias="sms_consent")
    smsStatus: str = Field("scheduled", validation_alias="sms_status")
    smsSentAt: Optional[str] = Field(None, validation_alias="sms_sent_at")
    smsError: Optional[str] = Field(None, validation_alias="sms_error")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class SmsDispatchResponse(BaseModel):
    success: bool
    message: str
    reminderId: str
    smsStatus: str
    messageId: Optional[str] = None
    recipientMasked: Optional[str] = None
    smsBody: Optional[str] = None
    error: Optional[str] = None
    trialMode: Optional[bool] = False
    templateName: Optional[str] = None


class SmsConfigResponse(BaseModel):
    provider: str
    devMode: bool
    isConfigured: bool
    maskedTwilioNumber: Optional[str] = None
    trialMode: Optional[bool] = False
    templateName: Optional[str] = None

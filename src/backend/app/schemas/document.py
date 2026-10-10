from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicalDocumentResponse(BaseModel):
    id: str
    userId: str = Field(..., validation_alias="user_id")
    filename: str
    fileSize: int = Field(..., validation_alias="file_size")
    mimeType: str = Field(..., validation_alias="mime_type")
    documentType: str = Field(..., validation_alias="document_type")
    uploadDate: str = Field(..., validation_alias="upload_date")
    documentDate: Optional[str] = Field(None, validation_alias="document_date")
    facilityOrDoctor: Optional[str] = Field(None, validation_alias="facility_or_doctor")
    status: str
    summary: Optional[str] = None
    extractedFieldsCount: int = Field(0, validation_alias="extracted_fields_count")
    unverifiedFieldsCount: int = Field(0, validation_alias="unverified_fields_count")
    pageCount: int = Field(1, validation_alias="page_count")
    fileUrl: Optional[str] = Field(None, validation_alias="file_url")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class DocumentCreate(BaseModel):
    documentType: str = "general"
    facility: Optional[str] = None

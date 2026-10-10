from typing import Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class ExtractedFieldResponse(BaseModel):
    id: str
    documentId: str = Field(..., validation_alias="document_id")
    category: str
    fieldName: str = Field(..., validation_alias="field_name")
    fieldValue: str = Field(..., validation_alias="field_value")
    normalizedValue: Optional[Union[float, str]] = Field(None, validation_alias="normalized_value")
    unit: Optional[str] = None
    referenceRange: Optional[str] = Field(None, validation_alias="reference_range")
    isAbnormal: bool = Field(False, validation_alias="is_abnormal")
    confidence: float
    pageNumber: int = Field(1, validation_alias="page_number")
    sourceSnippet: Optional[str] = Field(None, validation_alias="source_snippet")
    reviewStatus: str = Field(..., validation_alias="review_status")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ExtractedFieldUpdate(BaseModel):
    reviewStatus: str
    correctedValue: Optional[str] = None


class HealthFactResponse(BaseModel):
    id: str
    userId: str = Field(..., validation_alias="user_id")
    category: str
    testName: str = Field(..., validation_alias="test_name")
    value: float
    unit: str
    referenceRange: Optional[str] = Field(None, validation_alias="reference_range")
    isOutOfRange: bool = Field(False, validation_alias="is_out_of_range")
    observedDate: str = Field(..., validation_alias="observed_date")
    sourceDocumentId: Optional[str] = Field(None, validation_alias="source_document_id")
    sourceDocumentName: Optional[str] = Field(None, validation_alias="source_document_name")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

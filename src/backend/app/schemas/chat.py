from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CitationSource(BaseModel):
    documentId: str = Field(..., validation_alias="document_id")
    documentName: str = Field(..., validation_alias="document_name")
    page: int = 1
    snippet: str

    model_config = ConfigDict(populate_by_name=True)


class ChatMessageRequest(BaseModel):
    question: str
    conversationId: Optional[str] = Field(None, validation_alias="conversation_id")

    model_config = ConfigDict(populate_by_name=True)


class ChatMessageResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    timestamp: str
    citations: List[CitationSource] = []
    insufficientEvidence: bool = Field(False, validation_alias="insufficient_evidence")
    disclaimer: Optional[str] = (
        "This informational response is grounded in your uploaded records and does not replace a clinician evaluation."
    )
    suggestedQuestions: List[str] = Field(default_factory=list, validation_alias="suggested_questions")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)

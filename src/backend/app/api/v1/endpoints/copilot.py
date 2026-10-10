import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    CitationSource,
    ConversationResponse,
)
from app.services.audit_service import AuditService
from app.services.copilot_service import CopilotService

router = APIRouter()


@router.post("/chat", response_model=ChatMessageResponse)
def ask_copilot(
    payload: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Answers patient medical questions with strict document grounding, citations, and non-diagnostic disclaimers."""
    copilot_service = CopilotService(db)
    audit_service = AuditService(db)

    message = copilot_service.answer_question(
        user_id=current_user.id,
        question=payload.question,
        conversation_id=payload.conversationId
    )

    citations = []
    if message.citations_json:
        try:
            raw_citations = json.loads(message.citations_json)
            citations = [CitationSource(**c) for c in raw_citations]
        except Exception:
            pass

    audit_service.log(
        action="copilot_chat_query",
        user_id=current_user.id,
        resource_type="chat",
        resource_id=message.id,
        details=f"Query answered with {len(citations)} citations (insufficient_evidence={message.insufficient_evidence})"
    )

    return ChatMessageResponse(
        id=message.id,
        role=message.role,
        content=message.content,
        timestamp=message.timestamp,
        citations=citations,
        insufficient_evidence=message.insufficient_evidence,
        disclaimer=message.disclaimer,
        suggested_questions=[
            "What does my Haemoglobin trend show?",
            "How should I take Metoprolol Tartrate?",
            "Show my latest Fasting Blood Glucose result",
        ]
    )


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns conversation history belonging to the current user."""
    copilot_service = CopilotService(db)
    convs = copilot_service.get_user_conversations(current_user.id)
    return [
        ConversationResponse(
            id=c.id,
            title=c.title,
            created_at=c.created_at.isoformat()
        )
        for c in convs
    ]

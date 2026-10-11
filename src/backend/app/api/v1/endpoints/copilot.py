import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.chat import Conversation, Message
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    CitationSource,
    ConversationResponse,
)
from app.services.audit_service import AuditService
from app.services.copilot_service import CopilotService
from app.services.prescription_extraction_service import PrescriptionExtractionService

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


@router.post("/upload-and-extract", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_extract_image(
    file: UploadFile = File(...),
    prompt: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Uploads a prescription or medical report image directly within Copilot,
    runs OCR & clinical entity extraction, and returns structured extraction findings."""
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    service = PrescriptionExtractionService(db)
    audit_service = AuditService(db)

    filename = file.filename or "prescription_scan.jpg"
    rx = await service.extract_and_create_prescription(
        file_content=content,
        filename=filename,
        user_id=current_user.id,
        content_type=file.content_type or "image/jpeg",
    )

    med_count = len(rx.medications)
    detected_list = []
    for idx, med in enumerate(rx.medications, 1):
        detected_list.append(
            f"**{idx}. {med.name}** ({med.strength})\n"
            f"  • **Dosage & Route:** {med.dosage} ({med.route})\n"
            f"  • **Timing & Frequency:** {med.frequency} • {med.timing}\n"
            f"  • **Duration:** {med.duration}\n"
            f"  • **Instructions (English):** {med.instructions_english}\n"
            f"  • **తెలుగు వివరణ (Telugu):** {med.instructions_telugu}\n"
            f"  • **Confidence:** {int((med.confidence or 0.9) * 100)}%"
        )

    meds_section = "\n\n".join(detected_list) if detected_list else "No active medicines detected."

    full_content = (
        f"### 📋 Clinical Image Extraction Summary\n"
        f"I scanned and extracted clinical entities from your uploaded document **{filename}**.\n\n"
        f"• **Prescribed By / Facility:** {rx.prescribed_by}\n"
        f"• **Date:** {rx.prescribed_date}\n"
        f"• **Diagnosis / Indication:** {rx.diagnosis}\n\n"
        f"#### 💊 Detected Medications ({med_count}):\n"
        f"{meds_section}\n\n"
        f"⚠️ **Clinical Review Reminder:** Automated OCR extractions require your review before consuming medication. This entry has been synced to your **Prescriptions** section."
    )

    doc_id = rx.document_id or f"doc-{rx.id}"
    citation = CitationSource(
        document_id=doc_id,
        document_name=filename,
        page=1,
        snippet=f"Prescription record for {rx.prescribed_by}: {', '.join(m.name for m in rx.medications)}"
    )

    # Save to user conversation
    convs = db.query(Conversation).filter(Conversation.user_id == current_user.id).all()
    conv_id = convs[0].id if convs else None
    if not conv_id:
        conv = Conversation(user_id=current_user.id, title=f"Scan: {filename}")
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id

    now_time = datetime.now().strftime("%I:%M %p")
    msg = Message(
        conversation_id=conv_id,
        user_id=current_user.id,
        role="assistant",
        content=full_content,
        timestamp=now_time,
        citations_json=json.dumps([citation.model_dump()]),
        insufficient_evidence=False,
        disclaimer="This extraction is informational and grounded in your uploaded image. Always consult your doctor.",
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    audit_service.log(
        action="copilot_image_extracted",
        user_id=current_user.id,
        resource_type="prescription",
        resource_id=rx.id,
        details=f"Copilot extracted {med_count} medication entries from image {filename}"
    )

    return ChatMessageResponse(
        id=msg.id,
        role="assistant",
        content=full_content,
        timestamp=now_time,
        citations=[citation],
        insufficient_evidence=False,
        disclaimer="This informational extraction is grounded in your uploaded image.",
        suggested_questions=[
            "How should I take these medications?",
            "Set a daily reminder for this prescription",
            "Explain possible drug interactions",
        ],
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

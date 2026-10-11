from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.reminder import (
    ReminderCreate,
    ReminderResponse,
    ReminderUpdate,
    SmsConfigResponse,
    SmsDispatchResponse,
)
from app.services.audit_service import AuditService
from app.services.reminder_service import ReminderService
from app.services.sms_service import SmsService, get_sms_provider_status

router = APIRouter()


def _to_reminder_response(r) -> ReminderResponse:
    """Helper to convert a Reminder ORM model to ReminderResponse schema."""
    return ReminderResponse(
        id=r.id,
        medication_name=r.medication_name,
        strength=r.strength,
        scheduled_time=r.scheduled_time,
        slot=r.slot,
        timing_with_food=r.timing_with_food,
        status=r.status,
        taken_at=r.taken_at,
        dosage=r.dosage,
        frequency=r.frequency or "Once daily",
        phone_number=r.phone_number,
        recipient_name=r.recipient_name,
        sms_enabled=bool(r.sms_enabled),
        sms_consent=bool(r.sms_consent),
        sms_status=r.sms_status or "scheduled",
        sms_sent_at=r.sms_sent_at,
        sms_error=r.sms_error,
    )


@router.get("/sms-config", response_model=SmsConfigResponse)
def get_sms_config():
    """Returns safe provider configuration without exposing credentials.

    Enables frontend to display provider state (Mock mode vs Twilio gateway).
    """
    config_info = get_sms_provider_status()
    return SmsConfigResponse(
        provider=config_info["provider"],
        devMode=config_info["devMode"],
        isConfigured=config_info["isConfigured"],
        maskedTwilioNumber=config_info.get("maskedTwilioNumber"),
        trialMode=config_info.get("trialMode", False),
        templateName=config_info.get("templateName"),
    )


@router.get("", response_model=List[ReminderResponse])
@router.get("/", response_model=List[ReminderResponse])
def get_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all medication reminders configured for the authenticated user."""
    service = ReminderService(db)
    rems = service.get_user_reminders(current_user.id)
    return [_to_reminder_response(r) for r in rems]


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedules a new medication reminder with SMS reminder preferences and triggers automation."""
    # Default phone number to user's emergency contact if not explicitly supplied
    if not data.phoneNumber and current_user.emergency_contact:
        data.phoneNumber = current_user.emergency_contact

    # Default recipient name to user's registered name if not specified
    if not data.recipientName:
        data.recipientName = current_user.name

    service = ReminderService(db)
    audit_service = AuditService(db)

    created = await service.create_reminder(current_user.id, data)
    audit_service.log(
        action="reminder_created",
        user_id=current_user.id,
        resource_type="reminder",
        resource_id=created.id,
        details=f"Reminder scheduled for {created.medication_name} at {created.scheduled_time} (SMS: {'Enabled' if created.sms_enabled else 'Disabled'})",
    )

    return _to_reminder_response(created)


@router.patch("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: str,
    data: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates medication reminder adherence (taken, skipped, snoozed) or SMS preferences."""
    service = ReminderService(db)
    updated = service.update_status(reminder_id, current_user.id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or unauthorized.",
        )

    return _to_reminder_response(updated)


@router.post("/{reminder_id}/send-sms", response_model=SmsDispatchResponse)
async def send_reminder_sms(
    reminder_id: str,
    force: bool = Query(False, description="Bypass duplicate cooldown check for testing"),
    phone_override: Optional[str] = Query(None, description="Test delivery to an alternate authorized test number"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dispatches a personalized medication reminder SMS to the patient's phone.

    Prevents duplicate sends unless 'force' is specified, enforces patient consent,
    and supports dev/mock mode or live Twilio gateway.
    """
    service = ReminderService(db)
    reminder = service.get_reminder(reminder_id, current_user.id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or unauthorized.",
        )

    sms_service = SmsService(db)
    audit_service = AuditService(db)

    result = await sms_service.send_reminder_sms(
        reminder=reminder,
        recipient_name=current_user.name,
        phone_override=phone_override,
        force=force,
    )

    audit_service.log(
        action="sms_reminder_dispatched" if result.get("success") else "sms_reminder_failed",
        user_id=current_user.id,
        resource_type="reminder",
        resource_id=reminder.id,
        details=f"SMS reminder dispatch outcome: {result.get('status')} for medication {reminder.medication_name}",
    )

    if not result.get("success") and result.get("status") != "duplicate":
        # If it was rejected due to missing consent or phone validation, return 400 with clear message
        if "consent" in (result.get("error") or "").lower() or "phone" in (result.get("error") or "").lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error"),
            )

    return SmsDispatchResponse(
        success=bool(result.get("success")),
        message=result.get("message") or result.get("error") or "SMS processed",
        reminderId=reminder.id,
        smsStatus=result.get("smsStatus", "failed"),
        messageId=result.get("messageId"),
        recipientMasked=result.get("recipientMasked"),
        smsBody=result.get("smsBody"),
        error=result.get("error"),
        trialMode=result.get("trialMode", False),
        templateName=result.get("templateName"),
    )


@router.post("/dispatch-due-sms")
async def dispatch_due_sms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dispatches all scheduled SMS reminders that have patient consent and are pending."""
    service = ReminderService(db)
    sms_service = SmsService(db)
    audit_service = AuditService(db)

    scheduled = service.get_all_scheduled_sms_reminders(user_id=current_user.id)
    results = []

    for reminder in scheduled:
        res = await sms_service.send_reminder_sms(reminder=reminder)
        results.append({
            "reminderId": reminder.id,
            "medicationName": reminder.medication_name,
            "success": res.get("success"),
            "status": res.get("status"),
            "message": res.get("message") or res.get("error"),
        })

    audit_service.log(
        action="sms_batch_dispatch",
        user_id=current_user.id,
        resource_type="reminder",
        resource_id="batch",
        details=f"Dispatched {len(results)} due medication reminders",
    )

    return {
        "totalProcessed": len(results),
        "dispatched": [r for r in results if r["success"]],
        "failedOrSkipped": [r for r in results if not r["success"]],
    }


@router.delete("/{reminder_id}", response_model=MessageResponse)
def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancels and removes a medication reminder."""
    service = ReminderService(db)
    success = service.delete_reminder(reminder_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or unauthorized.",
        )
    return MessageResponse(message="Reminder successfully deleted.")

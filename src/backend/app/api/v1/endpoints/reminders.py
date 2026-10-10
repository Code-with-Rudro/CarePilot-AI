from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.reminder import ReminderCreate, ReminderResponse, ReminderUpdate
from app.services.audit_service import AuditService
from app.services.reminder_service import ReminderService

router = APIRouter()


@router.get("", response_model=List[ReminderResponse])
@router.get("/", response_model=List[ReminderResponse])
def get_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all medication reminders configured for the authenticated user."""
    service = ReminderService(db)
    rems = service.get_user_reminders(current_user.id)
    return [
        ReminderResponse(
            id=r.id,
            medication_name=r.medication_name,
            strength=r.strength,
            scheduled_time=r.scheduled_time,
            slot=r.slot,
            timing_with_food=r.timing_with_food,
            status=r.status,
            taken_at=r.taken_at
        )
        for r in rems
    ]


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedules a new medication reminder and triggers n8n push automation if configured."""
    service = ReminderService(db)
    audit_service = AuditService(db)

    created = await service.create_reminder(current_user.id, data)
    audit_service.log(
        action="reminder_created",
        user_id=current_user.id,
        resource_type="reminder",
        resource_id=created.id,
        details=f"Reminder scheduled for {created.medication_name} at {created.scheduled_time}"
    )

    return ReminderResponse(
        id=created.id,
        medication_name=created.medication_name,
        strength=created.strength,
        scheduled_time=created.scheduled_time,
        slot=created.slot,
        timing_with_food=created.timing_with_food,
        status=created.status,
        taken_at=created.taken_at
    )


@router.patch("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: str,
    data: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates medication reminder adherence (taken, skipped, snoozed)."""
    service = ReminderService(db)
    updated = service.update_status(reminder_id, current_user.id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or unauthorized."
        )

    return ReminderResponse(
        id=updated.id,
        medication_name=updated.medication_name,
        strength=updated.strength,
        scheduled_time=updated.scheduled_time,
        slot=updated.slot,
        timing_with_food=updated.timing_with_food,
        status=updated.status,
        taken_at=updated.taken_at
    )


@router.delete("/{reminder_id}", response_model=MessageResponse)
def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancels and removes a medication reminder."""
    service = ReminderService(db)
    success = service.delete_reminder(reminder_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or unauthorized."
        )
    return MessageResponse(message="Reminder successfully deleted.")

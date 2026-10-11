from datetime import datetime
from typing import List, Optional
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.constants import REMINDER_PENDING, REMINDER_TAKEN
from app.core.logging import logger
from app.models.reminder import Reminder
from app.repositories.reminder_repository import ReminderRepository
from app.schemas.reminder import ReminderCreate, ReminderUpdate


class ReminderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReminderRepository(db)

    def get_user_reminders(self, user_id: str) -> List[Reminder]:
        return self.repo.get_by_user(user_id)

    async def create_reminder(self, user_id: str, data: ReminderCreate) -> Reminder:
        reminder = Reminder(
            user_id=user_id,
            medication_name=data.medicationName,
            strength=data.strength,
            scheduled_time=data.scheduledTime,
            slot=data.slot or "morning",
            timing_with_food=data.timingWithFood,
            status=REMINDER_PENDING,
            dosage=data.dosage or data.strength,
            frequency=data.frequency or "Once daily",
            phone_number=data.phoneNumber,
            recipient_name=data.recipientName,
            sms_enabled=data.smsEnabled,
            sms_consent=data.smsConsent,
            sms_status="scheduled" if (data.smsEnabled and data.smsConsent) else "pending",
        )
        created = self.repo.create(reminder)

        # Trigger n8n webhook automation if configured
        if settings.N8N_WEBHOOK_URL:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    await client.post(
                        settings.N8N_WEBHOOK_URL,
                        json={
                            "event": "reminder_created",
                            "reminderId": created.id,
                            "medication": created.medication_name,
                            "time": created.scheduled_time,
                            "foodRelation": created.timing_with_food,
                            "userId": user_id
                        }
                    )
            except Exception as e:
                logger.warning(f"Failed to dispatch reminder to n8n webhook: {e}")

        return created

    def update_status(self, reminder_id: str, user_id: str, data: ReminderUpdate) -> Optional[Reminder]:
        reminder = self.repo.get_user_reminder(reminder_id, user_id)
        if not reminder:
            return None

        if data.status:
            reminder.status = data.status
            if data.status == REMINDER_TAKEN:
                reminder.taken_at = data.takenAt or datetime.now().strftime("%I:%M %p")

        if data.dosage is not None:
            reminder.dosage = data.dosage
        if data.frequency is not None:
            reminder.frequency = data.frequency
        if data.phoneNumber is not None:
            reminder.phone_number = data.phoneNumber
        if data.recipientName is not None:
            reminder.recipient_name = data.recipientName
        if data.smsEnabled is not None:
            reminder.sms_enabled = data.smsEnabled
        if data.smsConsent is not None:
            reminder.sms_consent = data.smsConsent
        if data.smsStatus is not None:
            reminder.sms_status = data.smsStatus

        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def get_reminder(self, reminder_id: str, user_id: str) -> Optional[Reminder]:
        return self.repo.get_user_reminder(reminder_id, user_id)

    def get_all_scheduled_sms_reminders(self, user_id: Optional[str] = None) -> List[Reminder]:
        query = self.db.query(Reminder).filter(
            Reminder.sms_enabled == True,
            Reminder.sms_consent == True,
            Reminder.sms_status != "sent"
        )
        if user_id:
            query = query.filter(Reminder.user_id == user_id)
        return query.all()

    def delete_reminder(self, reminder_id: str, user_id: str) -> bool:
        reminder = self.repo.get_user_reminder(reminder_id, user_id)
        if not reminder:
            return False
        self.repo.delete(reminder)
        return True

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
            status=REMINDER_PENDING
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

        reminder.status = data.status
        if data.status == REMINDER_TAKEN:
            reminder.taken_at = data.takenAt or datetime.now().strftime("%I:%M %p")

        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def delete_reminder(self, reminder_id: str, user_id: str) -> bool:
        reminder = self.repo.get_user_reminder(reminder_id, user_id)
        if not reminder:
            return False
        self.repo.delete(reminder)
        return True

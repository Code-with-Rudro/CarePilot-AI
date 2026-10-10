from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from app.repositories.base_repository import BaseRepository


class ReminderRepository(BaseRepository[Reminder]):
    def __init__(self, db: Session):
        super().__init__(Reminder, db)

    def get_by_user(self, user_id: str) -> List[Reminder]:
        return self.db.query(Reminder).filter(Reminder.user_id == user_id).order_by(Reminder.created_at.desc()).all()

    def get_user_reminder(self, reminder_id: str, user_id: str) -> Optional[Reminder]:
        return self.db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == user_id).first()

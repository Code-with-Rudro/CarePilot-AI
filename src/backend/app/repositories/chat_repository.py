from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.chat import Conversation, Message
from app.repositories.base_repository import BaseRepository


class ChatRepository(BaseRepository[Conversation]):
    def __init__(self, db: Session):
        super().__init__(Conversation, db)

    def get_user_conversations(self, user_id: str) -> List[Conversation]:
        return self.db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.created_at.desc()).all()

    def get_conversation_messages(self, conversation_id: str, user_id: str) -> List[Message]:
        return (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id, Message.user_id == user_id)
            .order_by(Message.created_at.asc())
            .all()
        )

    def add_message(self, message: Message) -> Message:
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.extracted_field import HealthFact
from app.models.prescription import Prescription
from app.repositories.base_repository import BaseRepository


class HealthFactRepository(BaseRepository[HealthFact]):
    def __init__(self, db: Session):
        super().__init__(HealthFact, db)

    def get_by_user(self, user_id: str) -> List[HealthFact]:
        return self.db.query(HealthFact).filter(HealthFact.user_id == user_id).order_by(HealthFact.observed_date.desc()).all()


class PrescriptionRepository(BaseRepository[Prescription]):
    def __init__(self, db: Session):
        super().__init__(Prescription, db)

    def get_by_user(self, user_id: str) -> List[Prescription]:
        return self.db.query(Prescription).filter(Prescription.user_id == user_id).order_by(Prescription.created_at.desc()).all()

    def get_user_prescription(self, prescription_id: str, user_id: str) -> Optional[Prescription]:
        return (
            self.db.query(Prescription)
            .filter(Prescription.id == prescription_id, Prescription.user_id == user_id)
            .first()
        )

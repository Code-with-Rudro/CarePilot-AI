from typing import List
from sqlalchemy.orm import Session
from app.models.extracted_field import HealthFact
from app.models.prescription import Prescription
from app.repositories.health_fact_repository import HealthFactRepository, PrescriptionRepository


class HealthFactService:
    def __init__(self, db: Session):
        self.db = db
        self.fact_repo = HealthFactRepository(db)
        self.rx_repo = PrescriptionRepository(db)

    def get_user_health_facts(self, user_id: str) -> List[HealthFact]:
        return self.fact_repo.get_by_user(user_id)

    def get_user_prescriptions(self, user_id: str) -> List[Prescription]:
        return self.rx_repo.get_by_user(user_id)

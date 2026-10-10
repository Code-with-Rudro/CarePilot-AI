from typing import List, Optional
from pydantic import BaseModel


class VerifiedMedicineInfo(BaseModel):
    name: str
    genericName: str
    standardStrength: str
    category: str
    primaryUse: str
    safetyAdvisory: str
    commonSideEffects: List[str]
    schedule: str
    teluguSummary: str
    verifiedManufacturer: str

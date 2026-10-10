from fastapi import APIRouter, Query
from app.core.constants import VERIFIED_MEDICINE_CATALOG
from app.schemas.medicine import VerifiedMedicineInfo

router = APIRouter()


@router.get("/lookup", response_model=VerifiedMedicineInfo)
def lookup_medicine(query: str = Query("paracetamol")):
    """Searches the verified medicine catalog for drug info, safety advisories, and Telugu explanations."""
    clean = query.lower().strip()
    for key, info in VERIFIED_MEDICINE_CATALOG.items():
        if key in clean:
            return VerifiedMedicineInfo(**info)

    # Fallback to paracetamol baseline
    return VerifiedMedicineInfo(**VERIFIED_MEDICINE_CATALOG["paracetamol"])

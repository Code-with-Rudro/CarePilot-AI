import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.document import Document
from app.models.extracted_field import ExtractedField, HealthFact
from app.models.prescription import MedicationInstruction, Prescription
from app.models.reminder import Reminder
from app.models.user import User


def seed_database(db: Session):
    """Seeds initial demonstration data if database is empty."""
    if db.query(User).first():
        return  # Database already seeded

    # 1. Create Default Users
    rudro_pwd = get_password_hash("carepilot123")
    rudro = User(
        id="user-rudro",
        email="rudro@altrixlabs.ai",
        hashed_password=rudro_pwd,
        name="Rudro Prasad Panigrahi",
        role="candidate",
        abha_id="91-4829-1029-4821",
        age=28,
        gender="Male",
        blood_group="B+",
        emergency_contact="+91 98765 43210"
    )
    db.add(rudro)

    reception = User(
        id="user-reception",
        email="reception@carepilot.demo",
        hashed_password=rudro_pwd,
        name="Hospital Reception Desk",
        role="receptionist",
        abha_id="91-0000-1111-2222",
        age=34,
        gender="Other"
    )
    db.add(reception)

    clinician = User(
        id="user-clinician",
        email="dr.srinivas@carepilot.demo",
        hashed_password=rudro_pwd,
        name="Dr. K. Srinivas (Cardiologist)",
        role="clinician_reviewer",
        abha_id="91-9999-8888-7777",
        age=45,
        gender="Male"
    )
    db.add(clinician)
    db.commit()

    # 2. Create Initial Documents for Rudro
    doc1 = Document(
        id="doc-001",
        user_id=rudro.id,
        filename="Apollo_Complete_Blood_Count_Report.pdf",
        file_size=2450000,
        mime_type="application/pdf",
        document_type="lab_report",
        upload_date="2026-10-07T10:15:00Z",
        document_date="2026-10-07",
        facility_or_doctor="Apollo Diagnostics, Hyderabad",
        status="processed",
        summary="Complete Blood Count showing mild microcytic anemia (Haemoglobin 11.2 g/dL). Normal WBC and platelets.",
        page_count=2
    )
    db.add(doc1)

    doc2 = Document(
        id="doc-002",
        user_id=rudro.id,
        filename="Care_Hospital_Cardio_Prescription.png",
        file_size=1120000,
        mime_type="image/png",
        document_type="prescription",
        upload_date="2026-10-09T14:30:00Z",
        document_date="2026-10-09",
        facility_or_doctor="Dr. K. Srinivas, Care Hospitals",
        status="needs_review",
        summary="Cardiology prescription for hypertension & GERD symptoms. Metoprolol Tartrate & Pantoprazole prescribed.",
        page_count=1
    )
    db.add(doc2)

    doc3 = Document(
        id="doc-003",
        user_id=rudro.id,
        filename="Metropolis_Comprehensive_Metabolic_Panel.pdf",
        file_size=3150000,
        mime_type="application/pdf",
        document_type="diagnostic",
        upload_date="2026-09-23T09:00:00Z",
        document_date="2026-09-23",
        facility_or_doctor="Metropolis Healthcare",
        status="processed",
        summary="Comprehensive metabolic panel with normal fasting blood glucose (98 mg/dL) and non-diabetic HbA1c (5.6%).",
        page_count=3
    )
    db.add(doc3)
    db.commit()

    # 3. Create Extracted Fields
    fields = [
        ExtractedField(
            id="fld-001",
            document_id=doc1.id,
            user_id=rudro.id,
            category="lab_test",
            field_name="Haemoglobin",
            field_value="11.2",
            normalized_value=11.2,
            unit="g/dL",
            reference_range="13.0 - 17.0 g/dL",
            is_abnormal=True,
            confidence=0.98,
            page_number=1,
            source_snippet="Haemoglobin (Cyanmethemoglobin method): 11.2 g/dL [13.0 - 17.0]",
            review_status="confirmed"
        ),
        ExtractedField(
            id="fld-002",
            document_id=doc1.id,
            user_id=rudro.id,
            category="lab_test",
            field_name="Total Leucocyte Count (WBC)",
            field_value="7400",
            normalized_value=7400.0,
            unit="cells/mcL",
            reference_range="4000 - 11000 cells/mcL",
            is_abnormal=False,
            confidence=0.97,
            page_number=1,
            source_snippet="TLC: 7,400 /mcL",
            review_status="confirmed"
        ),
        ExtractedField(
            id="fld-003",
            document_id=doc2.id,
            user_id=rudro.id,
            category="medication",
            field_name="Metoprolol Tartrate",
            field_value="25mg OD Morning",
            normalized_value=25.0,
            unit="mg",
            reference_range="1 tablet daily",
            is_abnormal=False,
            confidence=0.95,
            page_number=1,
            source_snippet="Tab. Metoprolol Tartrate 25mg - 1 Tab OD Morning after food",
            review_status="confirmed"
        ),
        ExtractedField(
            id="fld-004",
            document_id=doc2.id,
            user_id=rudro.id,
            category="medication",
            field_name="Pantoprazole",
            field_value="40mg OD Morning",
            normalized_value=40.0,
            unit="mg",
            reference_range="1 tablet before breakfast",
            is_abnormal=False,
            confidence=0.72,
            page_number=1,
            source_snippet="Tab. Panto? 40mg - 1 Tab Before Breakfast x 15 days",
            review_status="unverified"
        ),
        ExtractedField(
            id="fld-005",
            document_id=doc3.id,
            user_id=rudro.id,
            category="lab_test",
            field_name="Fasting Blood Glucose",
            field_value="98",
            normalized_value=98.0,
            unit="mg/dL",
            reference_range="70 - 100 mg/dL",
            is_abnormal=False,
            confidence=0.99,
            page_number=1,
            source_snippet="Glucose, Fasting: 98 mg/dL [70 - 100]",
            review_status="confirmed"
        ),
        ExtractedField(
            id="fld-006",
            document_id=doc3.id,
            user_id=rudro.id,
            category="lab_test",
            field_name="HbA1c",
            field_value="5.6",
            normalized_value=5.6,
            unit="%",
            reference_range="< 5.7 %",
            is_abnormal=False,
            confidence=0.99,
            page_number=1,
            source_snippet="HbA1c: 5.6% [< 5.7%]",
            review_status="confirmed"
        )
    ]
    for f in fields:
        db.add(f)
    db.commit()

    # 4. Create Health Facts
    facts = [
        HealthFact(
            id="fact-001",
            user_id=rudro.id,
            category="Diagnostic Lab",
            test_name="Haemoglobin",
            value=11.2,
            unit="g/dL",
            reference_range="13.0 - 17.0 g/dL",
            is_out_of_range=True,
            observed_date="2026-10-07",
            source_document_id=doc1.id,
            source_document_name=doc1.filename
        ),
        HealthFact(
            id="fact-002",
            user_id=rudro.id,
            category="Diagnostic Lab",
            test_name="Fasting Blood Glucose",
            value=98.0,
            unit="mg/dL",
            reference_range="70 - 100 mg/dL",
            is_out_of_range=False,
            observed_date="2026-09-23",
            source_document_id=doc3.id,
            source_document_name=doc3.filename
        ),
        HealthFact(
            id="fact-003",
            user_id=rudro.id,
            category="Diagnostic Lab",
            test_name="HbA1c",
            value=5.6,
            unit="%",
            reference_range="< 5.7 %",
            is_out_of_range=False,
            observed_date="2026-09-23",
            source_document_id=doc3.id,
            source_document_name=doc3.filename
        )
    ]
    for ft in facts:
        db.add(ft)
    db.commit()

    # 5. Prescriptions are intentionally not seeded so user starts with a clean empty state.
    # Prescriptions will be populated dynamically when a user uploads a prescription image.

    # 6. Create Initial Reminders
    rem1 = Reminder(
        id="rem-001",
        user_id=rudro.id,
        medication_name="Metoprolol Tartrate",
        strength="25mg",
        scheduled_time="08:30 AM",
        slot="morning",
        timing_with_food="After breakfast",
        status="taken",
        taken_at="08:32 AM"
    )
    db.add(rem1)

    rem2 = Reminder(
        id="rem-002",
        user_id=rudro.id,
        medication_name="Pantoprazole",
        strength="40mg",
        scheduled_time="07:45 AM",
        slot="morning",
        timing_with_food="Before breakfast",
        status="taken",
        taken_at="07:50 AM"
    )
    db.add(rem2)

    rem3 = Reminder(
        id="rem-003",
        user_id=rudro.id,
        medication_name="Atorvastatin",
        strength="10mg",
        scheduled_time="09:30 PM",
        slot="night",
        timing_with_food="After dinner",
        status="pending"
    )
    db.add(rem3)
    db.commit()

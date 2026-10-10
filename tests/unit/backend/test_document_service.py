import io
import pytest
from fastapi import UploadFile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.services.document_service import DocumentService
from app.services.extraction_service import ExtractionService


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    user = User(
        id="user-doc-test",
        email="doctest@carepilot.demo",
        hashed_password="hash",
        name="Doc Tester",
        role="candidate"
    )
    session.add(user)
    session.commit()
    try:
        yield session
    finally:
        session.close()


@pytest.mark.asyncio
async def test_document_upload_and_extraction(db_session):
    doc_service = DocumentService(db_session)
    extraction_service = ExtractionService(db_session)

    file_content = b"%PDF-1.4 Mock Lab Document Content"
    upload_file = UploadFile(
        filename="test_blood_report.pdf",
        file=io.BytesIO(file_content)
    )

    doc = await doc_service.save_upload(
        file=upload_file,
        user_id="user-doc-test",
        document_type="lab_report",
        facility="Apollo Test Lab"
    )

    assert doc.id is not None
    assert doc.filename == "test_blood_report.pdf"
    assert doc.facility_or_doctor == "Apollo Test Lab"

    # Verify extracted fields were created
    extractions = extraction_service.get_extractions("user-doc-test", doc.id)
    assert len(extractions) >= 3

    # Test review update and health fact sync
    unverified_field = next(f for f in extractions if f.review_status == "unverified")
    updated = extraction_service.update_field(
        field_id=unverified_field.id,
        user_id="user-doc-test",
        review_status="confirmed",
        corrected_value="32"
    )
    assert updated.review_status == "confirmed"
    assert updated.field_value == "32"

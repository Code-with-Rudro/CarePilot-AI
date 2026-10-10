import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.schemas.reminder import ReminderCreate, ReminderUpdate
from app.services.reminder_service import ReminderService


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    user = User(
        id="user-rem-test",
        email="remtest@carepilot.demo",
        hashed_password="hash",
        name="Rem Tester",
        role="candidate"
    )
    session.add(user)
    session.commit()
    try:
        yield session
    finally:
        session.close()


@pytest.mark.asyncio
async def test_reminder_lifecycle(db_session):
    rem_service = ReminderService(db_session)
    data = ReminderCreate(
        medicationName="Metoprolol",
        strength="25mg",
        scheduledTime="08:00 AM",
        slot="morning",
        timingWithFood="After breakfast"
    )

    created = await rem_service.create_reminder("user-rem-test", data)
    assert created.id is not None
    assert created.status == "pending"

    # Update adherence
    update_data = ReminderUpdate(status="taken", takenAt="08:05 AM")
    updated = rem_service.update_status(created.id, "user-rem-test", update_data)
    assert updated.status == "taken"
    assert updated.taken_at == "08:05 AM"

    # Delete
    deleted = rem_service.delete_reminder(created.id, "user-rem-test")
    assert deleted is True

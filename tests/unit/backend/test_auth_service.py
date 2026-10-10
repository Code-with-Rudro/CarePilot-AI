import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_password_hashing():
    password = "SuperSecurePassword123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_creation_and_decoding():
    user_id = "test-user-123"
    role = "candidate"
    token = create_access_token(subject=user_id, role=role)
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["role"] == role
    assert payload["iss"] == "carepilot-backend"


def test_register_and_authenticate_user(db_session):
    auth_service = AuthService(db_session)
    user_in = UserCreate(
        email="test_patient@altrixlabs.ai",
        password="ValidPassword123",
        name="Test Patient",
        role="candidate"
    )

    user, token = auth_service.register_user(user_in)
    assert user.id is not None
    assert user.email == "test_patient@altrixlabs.ai"
    assert user.role == "candidate"
    assert token is not None

    # Test duplicate registration rejection
    with pytest.raises(ValueError) as excinfo:
        auth_service.register_user(user_in)
    assert "already exists" in str(excinfo.value)

    # Test login success
    login_data = UserLogin(
        email="test_patient@altrixlabs.ai",
        password="ValidPassword123",
        role="candidate"
    )
    auth_user, auth_token = auth_service.authenticate_user(login_data)
    assert auth_user.id == user.id
    assert auth_token is not None

    # Test login wrong password
    bad_login = UserLogin(
        email="test_patient@altrixlabs.ai",
        password="WrongPassword123",
        role="candidate"
    )
    with pytest.raises(ValueError):
        auth_service.authenticate_user(bad_login)

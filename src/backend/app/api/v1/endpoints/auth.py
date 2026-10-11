from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse, UserUpdate
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user account and returns a valid JWT session."""
    auth_service = AuthService(db)
    audit_service = AuditService(db)
    try:
        user, token = auth_service.register_user(user_in)
        audit_service.log(
            action="user_registered",
            user_id=user.id,
            resource_type="user",
            resource_id=user.id,
            details=f"User registered with role: {user.role}"
        )
        return TokenResponse(
            token=token,
            user=UserResponse.model_validate(user)
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates user credentials and verifies role authorization."""
    auth_service = AuthService(db)
    audit_service = AuditService(db)
    try:
        user, token = auth_service.authenticate_user(login_data)
        audit_service.log(
            action="user_login_success",
            user_id=user.id,
            resource_type="user",
            resource_id=user.id,
            details=f"Successful login as {login_data.role}"
        )
        return TokenResponse(
            token=token,
            user=UserResponse.model_validate(user)
        )
    except ValueError as e:
        audit_service.log(
            action="user_login_failed",
            details=f"Invalid credentials for email {login_data.email}",
            status="failed"
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except PermissionError as e:
        audit_service.log(
            action="user_login_forbidden",
            details=f"Unauthorized role access: {str(e)}",
            status="failed"
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logs out the user and records the session termination event."""
    audit_service = AuditService(db)
    audit_service.log(
        action="user_logout",
        user_id=current_user.id,
        resource_type="user",
        resource_id=current_user.id
    )
    return MessageResponse(message="Session successfully terminated.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates the authenticated user's profile and contact details."""
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.emergency_contact is not None:
        current_user.emergency_contact = user_update.emergency_contact
    if user_update.abha_id is not None:
        current_user.abha_id = user_update.abha_id
    if user_update.blood_group is not None:
        current_user.blood_group = user_update.blood_group
    if user_update.age is not None:
        current_user.age = user_update.age
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


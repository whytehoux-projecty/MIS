from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.schemas.user import UserRegister, PendingUserResponse
from app.services import registration_service, notification_service
from app.core.system_status import is_system_open
from app.models.pending_user import PendingUser
from app.models.active_user import ActiveUser
from app.middleware.rate_limiter import register_rate_limiter

router = APIRouter()


# ============================================================================
# Schemas
# ============================================================================


class AvailabilityResponse(BaseModel):
    """Response schema for availability checks"""

    available: bool
    message: str = ""


# ============================================================================
# Availability Check Routes
# ============================================================================


@router.get("/check-email", response_model=AvailabilityResponse)
def check_email_availability(
    email: EmailStr = Query(..., description="Email address to check"),
    db: Session = Depends(get_db),
):
    """
    Check if an email address is available for registration

    Returns whether the email is already registered (pending or active).
    """
    # Check pending users
    pending = db.query(PendingUser).filter(PendingUser.email == email).first()

    if pending:
        return AvailabilityResponse(
            available=False,
            message="This email is already registered and pending approval",
        )

    # Check active users
    active = db.query(ActiveUser).filter(ActiveUser.email == email).first()

    if active:
        return AvailabilityResponse(
            available=False,
            message="This email is already registered",
        )

    return AvailabilityResponse(
        available=True,
        message="Email is available",
    )


@router.get("/check-username", response_model=AvailabilityResponse)
def check_username_availability(
    username: str = Query(
        ...,
        min_length=3,
        max_length=50,
        description="Username to check",
    ),
    db: Session = Depends(get_db),
):
    """
    Check if a username is available for registration

    Returns whether the username is already taken.
    """
    # Check pending users
    pending = (
        db.query(PendingUser).filter(PendingUser.username == username.lower()).first()
    )

    if pending:
        return AvailabilityResponse(
            available=False,
            message="This username is already taken",
        )

    # Check active users
    active = (
        db.query(ActiveUser).filter(ActiveUser.username == username.lower()).first()
    )

    if active:
        return AvailabilityResponse(
            available=False,
            message="This username is already taken",
        )

    return AvailabilityResponse(
        available=True,
        message="Username is available",
    )


# ============================================================================
# Registration Route
# ============================================================================


@router.post(
    "/",
    response_model=PendingUserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(register_rate_limiter.check_rate_limit)],
)
def register_user(
    user_data: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Register a new user (creates pending registration)

    This is called from Website A.com registration form
    User will be in pending state until admin approves
    """
    # Check if system is open
    if not is_system_open(db):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Registration is currently closed. "
                "Please try during operating hours."
            ),
        )

    try:
        # Create pending user
        pending_user = registration_service.create_pending_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            full_name=user_data.full_name,
            phone=user_data.phone,
            db=db,
            # Extended fields
            date_of_birth=user_data.date_of_birth,
            occupation=user_data.occupation,
            address=user_data.address,
            city=user_data.city,
            state=user_data.state,
            country=user_data.country,
            postal_code=user_data.postal_code,
            biography=user_data.biography,
            reference_details=user_data.reference_details,
            invitation_id=user_data.invitation_id,
            photo_ids=user_data.photo_ids,
            audio_oath_id=user_data.audio_oath_id,
            policies_accepted=user_data.policies_accepted,
        )

        # Send notification to admin
        background_tasks.add_task(
            notification_service.send_admin_notification,
            subject="New User Registration",
            message=(
                f"New user {user_data.username} ({user_data.email}) has registered "
                "and is awaiting approval."
            ),
        )

        return pending_user

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

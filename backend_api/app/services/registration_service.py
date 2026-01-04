from sqlalchemy.orm import Session
from datetime import datetime
from app.models.pending_user import PendingUser
from app.models.active_user import ActiveUser
from app.core.security import hash_password
from app.utils.token_generator import generate_auth_key
from typing import Optional, List, Dict
import json

def create_pending_user(
    email: str,
    username: str,
    password: str,
    full_name: str,
    phone: Optional[str],
    db: Session,
    # Extended fields
    date_of_birth: Optional[str] = None,
    occupation: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    postal_code: Optional[str] = None,
    biography: Optional[str] = None,
    reference_details: Optional[str] = None,
    invitation_id: Optional[int] = None,
    photo_ids: Optional[List[str]] = None,
    audio_oath_id: Optional[str] = None,
    policies_accepted: Optional[Dict[str, bool]] = None,
) -> PendingUser:
    """
    Create a new user registration request
    User goes into pending_users table awaiting admin approval
    """
    # Check if email already exists in pending users
    existing_pending = db.query(PendingUser).filter(
        PendingUser.email == email
    ).first()
    
    if existing_pending:
        raise ValueError("Email already registered and pending approval")
    
    # Check if email already exists in active users
    existing_active = db.query(ActiveUser).filter(
        ActiveUser.email == email
    ).first()
    
    if existing_active:
        raise ValueError("Email already registered and approved")
    
    # Check if username already taken
    existing_username = db.query(PendingUser).filter(
        PendingUser.username == username
    ).first()
    
    if existing_username:
        raise ValueError("Username already taken")
    
    # Create new pending user
    hashed_pwd = hash_password(password)
    
    pending_user = PendingUser(
        email=email,
        username=username,
        hashed_password=hashed_pwd,
        full_name=full_name,
        phone=phone,
        is_reviewed=False,
        # Extended fields
        date_of_birth=date_of_birth,
        occupation=occupation,
        address=address,
        city=city,
        state=state,
        country=country,
        postal_code=postal_code,
        biography=biography,
        reference_details=reference_details,
        invitation_id=invitation_id,
        photo_ids=",".join(photo_ids) if photo_ids else None,
        audio_oath_id=audio_oath_id,
        policies_accepted=json.dumps(policies_accepted) if policies_accepted else None
    )
    
    db.add(pending_user)
    db.commit()
    db.refresh(pending_user)
    
    return pending_user

def get_pending_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all users awaiting approval
    Admin uses this to see who needs review
    """
    return db.query(PendingUser).filter(
        PendingUser.is_reviewed == False
    ).offset(skip).limit(limit).all()

def get_pending_user_by_id(db: Session, user_id: int) -> Optional[PendingUser]:
    """
    Get a single pending user by ID
    """
    return db.query(PendingUser).filter(
        PendingUser.id == user_id
    ).first()

def approve_user(user_id: int, admin_notes: Optional[str], db: Session) -> ActiveUser:
    """
    Approve a pending user and move them to active_users
    This is called when admin clicks 'Approve' button
    """
    # Find the pending user
    pending_user = db.query(PendingUser).filter(
        PendingUser.id == user_id
    ).first()
    
    if not pending_user:
        raise ValueError("Pending user not found")
    
    if pending_user.is_reviewed:
        raise ValueError("User already reviewed")
    
    # Create active user with same details
    active_user = ActiveUser(
        email=pending_user.email,
        username=pending_user.username,
        hashed_password=pending_user.hashed_password,
        full_name=pending_user.full_name,
        phone=pending_user.phone,
        auth_key=generate_auth_key(),  # Generate unique UUID for authentication
        is_active=True,
        approved_at=datetime.utcnow()
    )
    
    db.add(active_user)
    
    # Mark pending user as reviewed
    pending_user.is_reviewed = True
    pending_user.admin_notes = admin_notes or "Approved"
    
    db.commit()
    db.refresh(active_user)
    
    return active_user

def reject_user(user_id: int, reason: str, db: Session) -> bool:
    """
    Reject a pending user registration
    User stays in pending_users but marked as reviewed
    """
    pending_user = db.query(PendingUser).filter(
        PendingUser.id == user_id
    ).first()
    
    if not pending_user:
        raise ValueError("Pending user not found")
    
    if pending_user.is_reviewed:
        raise ValueError("User already reviewed")
    
    # Mark as reviewed with rejection reason
    pending_user.is_reviewed = True
    pending_user.admin_notes = f"Rejected: {reason}"
    
    return True

def request_more_info(user_id: int, question: str, db: Session) -> PendingUser:
    """
    Request more information from a pending user
    Updates admin notes and keeps user correctly in pending state
    """
    pending_user = db.query(PendingUser).filter(
        PendingUser.id == user_id
    ).first()
    
    if not pending_user:
        raise ValueError("Pending user not found")
    
    if pending_user.is_reviewed:
        raise ValueError("User already reviewed")
    
    # Update admin notes with the question
    # We prefix to make it clear it's an inquiry
    pending_user.admin_notes = f"INFO REQUESTED: {question}"
    
    # We DO NOT set is_reviewed=True because we still want it in the pending list
    # But now the admin knows they are waiting for info
    
    db.commit()
    db.refresh(pending_user)
    
    return pending_user
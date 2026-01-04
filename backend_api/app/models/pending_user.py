from sqlalchemy import Column, String, Boolean, Text, Integer, ForeignKey
from app.models.base import BaseModel

class PendingUser(BaseModel):
    __tablename__ = "pending_users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    # Extended Registration Fields
    date_of_birth = Column(String, nullable=True)
    policies_accepted = Column(Text, nullable=True)  # JSON string
    occupation = Column(String, nullable=True)
    address = Column(String, nullable=True)  # JSON or formatted string
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    biography = Column(Text, nullable=True)
    reference_details = Column(Text, nullable=True)
    
    # Linked Data
    invitation_id = Column(Integer, nullable=True)
    photo_ids = Column(String, nullable=True)  # Comma separated IDs
    audio_oath_id = Column(String, nullable=True)
    
    # Admin will review these
    is_reviewed = Column(Boolean, default=False)
    admin_notes = Column(String, nullable=True)
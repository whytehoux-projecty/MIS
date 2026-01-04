from app.models.registered_service import RegisteredService
from sqlalchemy.orm import Session
import uuid
from typing import Optional

def register_new_service(
    service_name: str,
    service_url: str,
    description: Optional[str],
    db: Session
) -> RegisteredService:
    """
    Register a new service that will use this auth system
    Admin calls this to add ServiceB, AppC, etc.
    """
    # Check if service name already exists
    existing = db.query(RegisteredService).filter(
        RegisteredService.service_name == service_name
    ).first()
    
    if existing:
        raise ValueError("Service name already registered")
    
    # Generate unique API key for this service
    api_key = str(uuid.uuid4())
    
    service = RegisteredService(
        service_name=service_name,
        service_url=service_url,
        api_key=api_key,
        description=description,
        is_active=True
    )
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

def get_all_services(db: Session, include_inactive: bool = False):
    """
    Get list of all registered services
    """
    query = db.query(RegisteredService)
    
    if not include_inactive:
        query = query.filter(RegisteredService.is_active == True)
    
    return query.all()

def deactivate_service(service_id: int, db: Session) -> bool:
    """
    Deactivate a service (doesn't delete, just marks inactive)
    """
    service = db.query(RegisteredService).filter(
        RegisteredService.id == service_id
    ).first()
    
    if not service:
        raise ValueError("Service not found")
    
    service.is_active = False
    db.commit()
    
    return True
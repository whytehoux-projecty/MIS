from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.service import ServiceRegister, ServiceResponse
from app.services import service_management

router = APIRouter()

@router.post("/register", response_model=ServiceResponse)
def register_service(
    service_data: ServiceRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new service to use this auth system
    
    Admin calls this to add ServiceB, AppC, etc.
    Returns API key that service must use for authentication
    """
    try:
        service = service_management.register_new_service(
            service_name=service_data.service_name,
            service_url=service_data.service_url,
            description=service_data.description,
            db=db
        )
        
        return service
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/list", response_model=List[ServiceResponse])
def list_services(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get list of all registered services
    """
    services = service_management.get_all_services(db, include_inactive)
    return services

@router.post("/deactivate/{service_id}")
def deactivate_service(service_id: int, db: Session = Depends(get_db)):
    """
    Deactivate a service (doesn't delete, just marks inactive)
    """
    try:
        success = service_management.deactivate_service(service_id, db)
        return {"success": success, "message": f"Service {service_id} deactivated"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
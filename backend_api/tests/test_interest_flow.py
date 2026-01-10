import pytest
from unittest.mock import patch, AsyncMock
from sqlalchemy.orm import Session
from app.services import interest_service
from app.models.interest_request import InterestStatus, RequestSource, Gender, MaritalStatus

# Mock EmailService to avoid SMTP errors
@pytest.fixture(autouse=True)
def mock_email_service():
    with patch('app.services.interest_service.email_service') as mock:
        mock.send_invitation_email = AsyncMock()
        mock.send_rejection_email = AsyncMock()
        mock.send_info_request_email = AsyncMock()
        mock.send_admin_new_request_notification = AsyncMock()
        yield mock

@pytest.mark.asyncio
async def test_create_interest_request(db: Session, mock_email_service):
    data = {
        "given_name": "John",
        "family_name": "Doe",
        "primary_email": "john.doe@example.com",
        "primary_phone": "+1234567890",
        "gender": Gender.MALE,
        "marital_status": MaritalStatus.SINGLE_NO_RELATIONSHIP
    }
    
    result = await interest_service.create_interest_request(
        db, data, RequestSource.EXTERNAL_SPACE
    )
    
    assert result.id is not None
    assert result.status == InterestStatus.PENDING
    assert result.primary_email == "john.doe@example.com"
    # Verify admin notification sent
    mock_email_service.send_admin_new_request_notification.assert_called_once()

@pytest.mark.asyncio
async def test_approve_request(db: Session, mock_email_service):
    # Create pending request
    data = {
        "given_name": "Jane",
        "family_name": "Doe",
        "primary_email": "jane.doe@example.com",
        "primary_phone": "123",
        "gender": Gender.FEMALE,
        "marital_status": MaritalStatus.MARRIED
    }
    req = await interest_service.create_interest_request(
        db, data, RequestSource.EXTERNAL_SPACE
    )
    
    # Approve
    response = await interest_service.approve_request(
        db, req.id, "admin_user", "Notes", 24
    )
    
    assert response['success'] is True
    assert response['invitation_code'] is not None
    
    # Check status updated
    updated_req = interest_service.get_by_id(db, req.id)
    assert updated_req.status == InterestStatus.INVITED
    assert updated_req.reviewed_by == "admin_user"
    assert updated_req.invitation_id is not None
    
    # Verify email sent
    mock_email_service.send_invitation_email.assert_called()

@pytest.mark.asyncio
async def test_reject_request(db: Session, mock_email_service):
    data = {
        "given_name": "Bob", 
        "family_name": "Smith",
        "primary_email": "bob@example.com",
        "primary_phone": "123",
        "gender": Gender.MALE, 
        "marital_status": MaritalStatus.SINGLE_NO_RELATIONSHIP
    }
    req = await interest_service.create_interest_request(db, data, RequestSource.EXTERNAL_SPACE)
    
    await interest_service.reject_request(db, req.id, "admin_user", "Policy mismatch")
    
    updated_req = interest_service.get_by_id(db, req.id)
    assert updated_req.status == InterestStatus.REJECTED
    assert updated_req.rejection_reason == "Policy mismatch"
    
    mock_email_service.send_rejection_email.assert_called_once()

@pytest.mark.asyncio
async def test_admin_invite(db: Session, mock_email_service):
    data = {
        "given_name": "Admin",
        "family_name": "Invited",
        "primary_email": "invited@example.com",
        "primary_phone": "999",
        "gender": Gender.MALE,
        "marital_status": MaritalStatus.MARRIED,
        "admin_notes": "Direct invite"
    }
    
    result = await interest_service.create_admin_invite(db, data, "admin_user")
    
    assert result['success'] is True
    
    # Check it exists and status is INVITED (skipped pending)
    req = interest_service.get_by_email(db, "invited@example.com")
    assert req is not None
    assert req.status == InterestStatus.INVITED
    assert req.source == RequestSource.ADMIN_DIRECT
    assert req.reviewed_by == "admin_user"
    
    mock_email_service.send_invitation_email.assert_called()

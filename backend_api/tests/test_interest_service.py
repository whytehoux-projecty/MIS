import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from app.services import interest_service
from app.models.interest_request import InterestStatus

@pytest.fixture
def mock_db():
    """Mock database session"""
    return MagicMock(spec=Session)

@pytest.fixture
def sample_request_data():
    """Sample interest request data"""
    return {
        "given_name": "John",
        "middle_name": "Paul",
        "family_name": "Doe",
        "alias": "JP",
        "gender": "male",
        "marital_status": "single_no_relationship",
        "primary_email": "john.doe@example.com",
        "primary_phone": "+2348012345678",
        "has_referral": False
    }

class TestCreateInterestRequest:
    """Test interest request creation"""
    
    @pytest.mark.asyncio
    async def test_create_request(self, mock_db, sample_request_data):
        """Should create request with correct data"""
        # Mock query to return None (no duplicate)
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = await interest_service.create_interest_request(
            mock_db, sample_request_data
        )
        assert mock_db.add.called
        assert mock_db.commit.called
        assert result.given_name == "John"
    
    @pytest.mark.asyncio
    async def test_duplicate_email_rejection(self, mock_db, sample_request_data):
        """Should reject duplicate emails"""
        # Setup existing request mock with status
        mock_request = MagicMock()
        mock_request.status = InterestStatus.PENDING
        mock_db.query.return_value.filter.return_value.first.return_value = mock_request
        
        with pytest.raises(ValueError, match="already submitted"):
            await interest_service.create_interest_request(
                mock_db, sample_request_data
            )

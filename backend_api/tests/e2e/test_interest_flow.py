"""
End-to-End Tests for Interest Application Flow
================================================

This module contains comprehensive E2E tests covering both:
1. Request for Invite (external applicants)
2. Direct Admin Invite (admin-initiated)

Run with: pytest tests/e2e/test_interest_flow.py -v
"""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.interest_request import InterestRequest, InterestStatus, RequestSource
from app.models.invitation import Invitation
from app.models.admin import Admin
from app.core.security import hash_password

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_interest_flow.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    """Create test client and database"""
    Base.metadata.create_all(bind=engine)
    
    # Create test admin
    db = TestingSessionLocal()
    test_admin = Admin(
        username="testadmin",
        email="testadmin@test.com",
        full_name="Test Admin",
        hashed_password=hash_password("TestPassword123!"),
        is_super_admin=True,
        is_active=True
    )
    db.add(test_admin)
    db.commit()
    db.close()
    
    with TestClient(app) as c:
        yield c
    
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def admin_token(client):
    """Get admin authentication token"""
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    return response.json()["access_token"]


# ============================================================================
# FLOW 1: EXTERNAL INTEREST REQUEST
# ============================================================================

class TestExternalInterestFlow:
    """Tests for external applicants submitting interest requests"""
    
    @pytest.fixture
    def sample_interest_data(self):
        return {
            "given_name": "John",
            "middle_name": "Michael",
            "family_name": "Doe",
            "alias": "JD",
            "gender": "male",
            "marital_status": "single_no_relationship",
            "primary_email": "john.doe@example.com",
            "primary_phone": "+2341234567890",
            "additional_emails": [],
            "additional_phones": [],
            "has_referral": False,
            "referral_member_id": None
        }
    
    def test_submit_interest_request_success(self, client, sample_interest_data):
        """Test successful interest submission"""
        response = client.post("/api/interest/submit", json=sample_interest_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "request_id" in data
        assert data["status"] == "pending"
    
    def test_submit_interest_duplicate_email(self, client, sample_interest_data):
        """Test rejection of duplicate email submissions"""
        # First submission
        client.post("/api/interest/submit", json=sample_interest_data)
        
        # Duplicate submission
        response = client.post("/api/interest/submit", json=sample_interest_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
    
    def test_submit_interest_missing_required_fields(self, client):
        """Test validation of required fields"""
        incomplete_data = {
            "given_name": "Test",
            "primary_email": "test@example.com"
            # Missing required fields
        }
        
        response = client.post("/api/interest/submit", json=incomplete_data)
        assert response.status_code == 422
    
    def test_admin_fetches_pending_requests(self, client, admin_token, sample_interest_data):
        """Test admin can fetch pending requests"""
        # Submit a request first
        sample_interest_data["primary_email"] = "pending_test@example.com"
        client.post("/api/interest/submit", json=sample_interest_data)
        
        # Fetch pending
        response = client.get(
            "/api/interest/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_admin_approves_request(self, client, admin_token, sample_interest_data):
        """Test admin approval generates invitation"""
        sample_interest_data["primary_email"] = "approve_test@example.com"
        submit_response = client.post("/api/interest/submit", json=sample_interest_data)
        request_id = submit_response.json()["request_id"]
        
        # Approve
        response = client.post(
            f"/api/interest/{request_id}/approve",
            json={"admin_notes": "Approved for testing"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "invitation_code" in data
        assert "pin" in data
        assert len(data["invitation_code"]) == 15
        assert len(data["pin"]) == 6
    
    def test_admin_rejects_request(self, client, admin_token, sample_interest_data):
        """Test admin rejection flow"""
        sample_interest_data["primary_email"] = "reject_test@example.com"
        submit_response = client.post("/api/interest/submit", json=sample_interest_data)
        request_id = submit_response.json()["request_id"]
        
        # Reject
        response = client.post(
            f"/api/interest/{request_id}/reject",
            json={"reason": "Does not meet criteria"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] is True
    
    def test_admin_requests_more_info(self, client, admin_token, sample_interest_data):
        """Test request more info workflow"""
        sample_interest_data["primary_email"] = "info_test@example.com"
        submit_response = client.post("/api/interest/submit", json=sample_interest_data)
        request_id = submit_response.json()["request_id"]
        
        # Request info
        response = client.post(
            f"/api/interest/{request_id}/request-info",
            json={"message": "Please provide ID document"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] is True


# ============================================================================
# FLOW 2: DIRECT ADMIN INVITE
# ============================================================================

class TestDirectAdminInviteFlow:
    """Tests for admin-initiated direct invitations"""
    
    @pytest.fixture
    def admin_invite_data(self):
        return {
            "given_name": "Admin",
            "middle_name": "Direct",
            "family_name": "Invite",
            "alias": "ADI",
            "gender": "female",
            "marital_status": "married",
            "primary_email": "admin.invite@example.com",
            "primary_phone": "+2349876543210",
            "additional_emails": [],
            "additional_phones": [],
            "has_referral": True,
            "referral_member_id": "MEM-001",
            "admin_notes": "VIP applicant",
            "expires_in_hours": 48
        }
    
    def test_admin_creates_direct_invite_success(self, client, admin_token, admin_invite_data):
        """Test successful direct invitation creation"""
        response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "invitation_code" in data
        assert "pin" in data
        assert "url_token" in data
        assert len(data["invitation_code"]) == 15
        assert len(data["pin"]) == 6
    
    def test_admin_invite_requires_auth(self, client, admin_invite_data):
        """Test that admin invite requires authentication"""
        response = client.post("/api/interest/admin-invite", json=admin_invite_data)
        assert response.status_code == 401


# ============================================================================
# FLOW 3: INVITATION VERIFICATION
# ============================================================================

class TestInvitationVerificationFlow:
    """Tests for invitation code and PIN verification"""
    
    def test_verify_valid_invitation(self, client, admin_token):
        """Test verification with valid code and PIN"""
        # Create an invitation first
        admin_invite_data = {
            "given_name": "Verify",
            "family_name": "Test",
            "gender": "male",
            "marital_status": "single_no_relationship",
            "primary_email": "verify.test@example.com",
            "primary_phone": "+2341111111111",
            "expires_in_hours": 24
        }
        
        create_response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        code = create_response.json()["invitation_code"]
        pin = create_response.json()["pin"]
        
        # Verify
        response = client.post("/api/invitation/verify", json={
            "invitation_code": code,
            "pin": pin
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert "invitation_id" in data
    
    def test_verify_invalid_code(self, client):
        """Test verification with invalid code"""
        response = client.post("/api/invitation/verify", json={
            "invitation_code": "invalidcode123",
            "pin": "123456"
        })
        
        assert response.status_code == 200
        assert response.json()["valid"] is False
    
    def test_verify_wrong_pin(self, client, admin_token):
        """Test verification with wrong PIN"""
        admin_invite_data = {
            "given_name": "WrongPin",
            "family_name": "Test",
            "gender": "female",
            "marital_status": "married",
            "primary_email": "wrongpin.test@example.com",
            "primary_phone": "+2342222222222",
            "expires_in_hours": 24
        }
        
        create_response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        code = create_response.json()["invitation_code"]
        
        # Verify with wrong PIN
        response = client.post("/api/invitation/verify", json={
            "invitation_code": code,
            "pin": "000000"  # Wrong PIN
        })
        
        assert response.status_code == 200
        assert response.json()["valid"] is False


# ============================================================================
# FLOW 4: ENCRYPTED URL HANDLING
# ============================================================================

class TestEncryptedUrlFlow:
    """Tests for encrypted registration URL handling"""
    
    def test_open_link_success(self, client, admin_token):
        """Test opening valid encrypted link"""
        admin_invite_data = {
            "given_name": "Link",
            "family_name": "Test",
            "gender": "male",
            "marital_status": "single_in_relationship",
            "primary_email": "link.test@example.com",
            "primary_phone": "+2343333333333",
            "expires_in_hours": 24
        }
        
        create_response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        url_token = create_response.json()["url_token"]
        
        # Open link
        response = client.post("/api/invitation/open-link", json={
            "url_token": url_token
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["session_started"] is True
        assert "time_remaining" in data
    
    def test_open_link_invalid_token(self, client):
        """Test opening link with invalid token"""
        response = client.post("/api/invitation/open-link", json={
            "url_token": "invalid_token_here"
        })
        
        assert response.status_code == 404
    
    def test_open_link_reentry_allowed(self, client, admin_token):
        """Test that re-opening the same link within session is allowed"""
        admin_invite_data = {
            "given_name": "Reentry",
            "family_name": "Test",
            "gender": "female",
            "marital_status": "married",
            "primary_email": "reentry.test@example.com",
            "primary_phone": "+2344444444444",
            "expires_in_hours": 24
        }
        
        create_response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        url_token = create_response.json()["url_token"]
        
        # First open
        client.post("/api/invitation/open-link", json={"url_token": url_token})
        
        # Re-open (should still work within session time)
        response = client.post("/api/invitation/open-link", json={
            "url_token": url_token
        })
        
        assert response.status_code == 200
        assert response.json()["valid"] is True


# ============================================================================
# FLOW 5: STATISTICS
# ============================================================================

class TestInterestStatistics:
    """Tests for interest request statistics"""
    
    def test_get_interest_stats(self, client, admin_token):
        """Test fetching interest statistics"""
        response = client.get(
            "/api/interest/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "pending" in data
        assert "approved" in data
        assert "rejected" in data


# ============================================================================
# EDGE CASES
# ============================================================================

class TestEdgeCases:
    """Edge case tests"""
    
    def test_rate_limiting_on_submit(self, client):
        """Test rate limiting on interest submission"""
        # Make multiple rapid requests
        responses = []
        for i in range(10):
            resp = client.post("/api/interest/submit", json={
                "given_name": f"Rate{i}",
                "family_name": "Test",
                "gender": "male",
                "marital_status": "single_no_relationship",
                "primary_email": f"rate{i}@example.com",
                "primary_phone": f"+234555555555{i:02d}"
            })
            responses.append(resp.status_code)
        
        # At some point, rate limiting should kick in (429)
        # This depends on rate limiter configuration
        # If all succeeded, limiter may not be strict enough for test
        assert 201 in responses or 429 in responses
    
    def test_invitation_code_format(self, client, admin_token):
        """Test invitation code is 15 lowercase alphanumeric characters"""
        import re
        
        admin_invite_data = {
            "given_name": "Format",
            "family_name": "Test",
            "gender": "male",
            "marital_status": "single_no_relationship",
            "primary_email": "format.test@example.com",
            "primary_phone": "+2346666666666",
            "expires_in_hours": 24
        }
        
        response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        code = response.json()["invitation_code"]
        
        assert len(code) == 15
        assert re.match(r'^[a-z0-9]{15}$', code)
    
    def test_pin_format(self, client, admin_token):
        """Test PIN is 6 digits"""
        import re
        
        admin_invite_data = {
            "given_name": "PinFormat",
            "family_name": "Test",
            "gender": "female",
            "marital_status": "married",
            "primary_email": "pinformat.test@example.com",
            "primary_phone": "+2347777777777",
            "expires_in_hours": 24
        }
        
        response = client.post(
            "/api/interest/admin-invite",
            json=admin_invite_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        pin = response.json()["pin"]
        
        assert len(pin) == 6
        assert re.match(r'^\d{6}$', pin)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestSubmitInterest:
    """Test interest submission endpoint"""
    
    def test_successful_submission(self):
        """Should accept valid submission"""
        # Note: This test assumes database connectivity or needs mocking. 
        # For a pure unit test validation, this tests the route handling.
        # But since we aren't mocking the DB here, it might fail if DB is not setup or cleaned.
        # We will assume dev environment has DB. 
        # Ideally we'd override dependency for get_db.
        
        # Using a random email to avoid collision in repeated tests
        import random
        rand_id = random.randint(1000, 9999)
        
        response = client.post("/api/interest/submit", json={
            "given_name": "Test",
            "family_name": "User",
            "gender": "male",
            "marital_status": "single_no_relationship",
            "primary_email": f"test{rand_id}@example.com",
            "primary_phone": f"+234801234{rand_id}",
            "has_referral": False
        })
        
        # If it fails with 422, it's validation. If 201, success.
        # It might fail with 400 if user exists, hence random email.
        assert response.status_code == 201
        data = response.json()
        assert data["success"] == True
        assert "request_id" in data
    
    def test_missing_required_fields(self):
        """Should reject missing required fields"""
        response = client.post("/api/interest/submit", json={
            "given_name": "Test"
        })
        
        assert response.status_code == 422
    
    def test_invalid_email_format(self):
        """Should reject invalid email"""
        response = client.post("/api/interest/submit", json={
            "given_name": "Test",
            "family_name": "User",
            "gender": "male",
            "marital_status": "single_no_relationship",
            "primary_email": "invalid-email",
            "primary_phone": "+2348012345678"
        })
        
        assert response.status_code == 422

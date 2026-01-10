# 🧪 Testing Guide

> **Document:** 09_TESTING_GUIDE.md  
> **Created:** 2026-01-10  
> **Priority:** 🟡 High

---

## Overview

This guide covers testing procedures for the Interest Application flow.

---

## 1. Unit Tests

### Backend Tests

#### File: `backend_api/tests/test_invitation_service.py`

```python
import pytest
from app.services.invitation_service import (
    generate_invitation_code,
    generate_pin,
    generate_url_token
)


class TestCodeGeneration:
    """Test invitation code generation"""
    
    def test_code_length(self):
        """Code should be exactly 15 characters"""
        code = generate_invitation_code()
        assert len(code) == 15
    
    def test_code_alphanumeric(self):
        """Code should be lowercase alphanumeric only"""
        code = generate_invitation_code()
        assert code.isalnum()
        assert code == code.lower()
    
    def test_code_uniqueness(self):
        """Generated codes should be unique"""
        codes = [generate_invitation_code() for _ in range(100)]
        assert len(codes) == len(set(codes))


class TestPinGeneration:
    """Test PIN generation"""
    
    def test_pin_length(self):
        """PIN should be exactly 6 digits"""
        pin = generate_pin()
        assert len(pin) == 6
    
    def test_pin_numeric(self):
        """PIN should be numeric only"""
        pin = generate_pin()
        assert pin.isdigit()


class TestUrlToken:
    """Test URL token generation"""
    
    def test_token_length(self):
        """Token should be at least 32 characters"""
        token = generate_url_token()
        assert len(token) >= 32
    
    def test_token_url_safe(self):
        """Token should be URL-safe"""
        import re
        token = generate_url_token()
        assert re.match(r'^[A-Za-z0-9_-]+$', token)
```

#### File: `backend_api/tests/test_interest_service.py`

```python
import pytest
from unittest.mock import patch, AsyncMock
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
        result = await interest_service.create_interest_request(
            mock_db, sample_request_data
        )
        assert mock_db.add.called
        assert mock_db.commit.called
    
    @pytest.mark.asyncio
    async def test_duplicate_email_rejection(self, mock_db, sample_request_data):
        """Should reject duplicate emails"""
        # Setup existing request
        mock_db.query.return_value.filter.return_value.first.return_value = True
        
        with pytest.raises(ValueError, match="already submitted"):
            await interest_service.create_interest_request(
                mock_db, sample_request_data
            )
```

---

## 2. Integration Tests

### API Endpoint Tests

#### File: `backend_api/tests/test_interest_routes.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestSubmitInterest:
    """Test interest submission endpoint"""
    
    def test_successful_submission(self):
        """Should accept valid submission"""
        response = client.post("/api/interest/submit", json={
            "given_name": "Test",
            "family_name": "User",
            "gender": "male",
            "marital_status": "single_no_relationship",
            "primary_email": "test@example.com",
            "primary_phone": "+2348012345678"
        })
        
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


class TestInvitationVerification:
    """Test invitation verification endpoint"""
    
    def test_valid_invitation(self, test_invitation):
        """Should verify valid invitation"""
        response = client.post("/api/invitation/verify", json={
            "code": test_invitation.code,
            "pin": test_invitation.pin
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
    
    def test_invalid_code(self):
        """Should reject invalid code"""
        response = client.post("/api/invitation/verify", json={
            "code": "invalidcode12345",
            "pin": "123456"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
    
    def test_wrong_pin(self, test_invitation):
        """Should reject wrong PIN"""
        response = client.post("/api/invitation/verify", json={
            "code": test_invitation.code,
            "pin": "000000"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
```

---

## 3. End-to-End Test Scenarios

### Scenario 1: External Application Flow

```gherkin
Feature: External Interest Application

  Scenario: Successful external application
    Given I am on the SPACE website
    When I fill the interest form with valid data
    And I submit the form
    Then I should see a success message
    And I should receive a confirmation email
    
    When an admin approves my request
    Then I should receive an invitation email
    And the email should contain a 15-character code
    And the email should contain a 6-digit PIN
    And the email should contain a registration link
    
    When I click the registration link
    Then the 5-hour session timer should start
    And I should be redirected to the verification page
    
    When I enter my code and PIN
    Then I should proceed to registration
```

### Scenario 2: Admin Direct Invite

```gherkin
Feature: Admin Direct Invite

  Scenario: Admin creates direct invitation
    Given I am logged into the admin interface
    When I navigate to "Create Invitation"
    And I fill in applicant details
    And I click "Create & Send"
    Then an invitation should be created
    And an email should be sent to the applicant
    And the status should show "Invited"
```

### Scenario 3: Session Expiry

```gherkin
Feature: Session Timer Expiry

  Scenario: Session expires after 5 hours
    Given I have a valid invitation
    And I clicked the registration link
    When 5 hours have passed
    Then I should see a "Session Expired" message
    And I should not be able to continue registration
```

---

## 4. Manual Testing Checklist

### Before Testing

- [ ] Backend is running (`uvicorn app.main:app --reload`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database migrations are applied
- [ ] Email service is configured (or using mock)

### Test Cases

#### Interest Submission

- [ ] Submit form with all required fields → Success
- [ ] Submit form with missing fields → Error shown
- [ ] Submit with existing email → Duplicate error
- [ ] Submit with invalid phone → Validation error

#### Admin Actions

- [ ] View pending requests → List shown
- [ ] Approve request → Invitation generated
- [ ] Reject request → Rejection email sent
- [ ] Request more info → Info request email sent

#### Invitation Verification

- [ ] Enter valid code + PIN → Proceed to registration
- [ ] Enter invalid code → Error message
- [ ] Enter wrong PIN → Error message
- [ ] Enter expired code → Expiry message

#### Session Timer

- [ ] Click link → 5-hour timer starts
- [ ] Navigate away and return → Timer continues
- [ ] Let timer expire → Session expired message

#### Complete Flow

- [ ] Submit interest → Approve → Invite → Register → Complete

---

## 5. Running Tests

```bash
# Backend tests
cd backend_api
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html

# Frontend tests
cd registration_portal
npm test

# E2E tests (if using Playwright)
npx playwright test
```

---

## 6. Test Data

### Sample Invitation Codes for Testing

| Code | PIN | Status | Notes |
|------|-----|--------|-------|
| `abc123def456ghi` | `123456` | Valid | Standard test |
| `expired12345678` | `111111` | Expired | Test expiry |
| `usedcode1234567` | `222222` | Used | Test reuse |

### Sample Email for Testing

- `test@example.com` - Valid format
- `invalid-email` - Invalid format
- `existing@test.com` - Already registered

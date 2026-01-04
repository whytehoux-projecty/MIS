import pytest
from fastapi import status
from app.models.registered_service import RegisteredService
from app.models.active_user import ActiveUser
from app.core.security import hash_password
import uuid

@pytest.fixture
def test_service(db):
    service = RegisteredService(
        service_name="Test Service",
        service_url="http://testservice.com",
        api_key=str(uuid.uuid4()),
        description="A service for testing"
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@pytest.fixture
def test_user(db):
    user = ActiveUser(
        email="user@test.com",
        username="usertest",
        full_name="User Test",
        hashed_password=hash_password("userpass"),
        phone="+1234567890",
        auth_key=str(uuid.uuid4()),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_qr_flow_complete(client, test_service, test_user):
    # 1. Generate QR
    response_gen = client.post("/api/auth/qr/generate", json={
        "service_id": test_service.id,
        "service_api_key": test_service.api_key
    })
    assert response_gen.status_code == status.HTTP_200_OK
    qr_data = response_gen.json()
    qr_token = qr_data["qr_token"]
    assert "qr_image" in qr_data

    # 2. Scan QR
    response_scan = client.post("/api/auth/qr/scan", json={
        "qr_token": qr_token,
        "user_auth_key": test_user.auth_key
    })
    assert response_scan.status_code == status.HTTP_200_OK
    scan_data = response_scan.json()
    assert scan_data["success"] is True
    pin = scan_data["pin"]

    # 3. Verify PIN
    response_verify = client.post("/api/auth/pin/verify", json={
        "qr_token": qr_token,
        "pin": pin
    })
    assert response_verify.status_code == status.HTTP_200_OK
    verify_data = response_verify.json()
    assert verify_data["success"] is True
    assert "session_token" in verify_data

def test_qr_generate_invalid_key(client, test_service):
    response = client.post("/api/auth/qr/generate", json={
        "service_id": test_service.id,
        "service_api_key": "wrong_key"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_qr_scan_invalid_token(client, test_user):
    response = client.post("/api/auth/qr/scan", json={
        "qr_token": "invalid_token",
        "user_auth_key": test_user.auth_key
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_pin_verify_invalid_pin(client, test_service, test_user):
    # Generate valid session first to get a token
    response_gen = client.post("/api/auth/qr/generate", json={
        "service_id": test_service.id,
        "service_api_key": test_service.api_key
    })
    qr_token = response_gen.json()["qr_token"]

    # Scan to transition state
    client.post("/api/auth/qr/scan", json={
        "qr_token": qr_token,
        "user_auth_key": test_user.auth_key
    })

    # Try verify with wrong PIN
    response = client.post("/api/auth/pin/verify", json={
        "qr_token": qr_token,
        "pin": "000000"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

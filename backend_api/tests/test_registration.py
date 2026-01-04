import pytest
from fastapi import status

def test_register_user_success(client):
    response = client.post("/api/register/", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "SecurePass123!",
        "full_name": "Test User",
        "phone": "+1234567890"
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["is_reviewed"] == False

def test_register_duplicate_email(client):
    # First registration
    client.post("/api/register/", json={
        "email": "duplicate@example.com",
        "username": "user1",
        "password": "SecurePass123!",
        "full_name": "User One"
    })
    
    # Second registration with same email
    response = client.post("/api/register/", json={
        "email": "duplicate@example.com",
        "username": "user2",
        "password": "SecurePass123!",
        "full_name": "User Two"
    })
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"]

import pytest
from fastapi import status
from app.models.admin import Admin
from app.core.security import hash_password

@pytest.fixture
def test_admin(db):
    admin = Admin(
        username="admin_test",
        email="admin@test.com",
        full_name="Test Admin",
        hashed_password=hash_password("adminpass"),
        is_super_admin=True,
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

def test_admin_login_success(client, test_admin):
    response = client.post("/api/admin/login", json={
        "username": "admin_test",
        "password": "adminpass"
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_admin_login_failure(client, test_admin):
    response = client.post("/api/admin/login", json={
        "username": "admin_test",
        "password": "wrongpassword"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_pending_users_unauthorized(client):
    response = client.get("/api/admin/pending")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_pending_users_authorized(client, test_admin):
    # Login first
    login_res = client.post("/api/admin/login", json={
        "username": "admin_test",
        "password": "adminpass"
    })
    token = login_res.json()["access_token"]
    
    # Access protected route
    response = client.get(
        "/api/admin/pending",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)

# Central-Auth-API: User Guide

## Introduction

The Central-Auth-API is the backbone of your authentication system. It controls who can register, who gets approved, and how users log into connected services using QR codes and PINs.

Think of it like a security checkpoint at an exclusive club:

1. **Registration Desk** - Where new members apply
2. **VIP Approval** - Where the manager reviews applications
3. **QR Scanner** - The high-tech entry system
4. **Session Badge** - Your temporary access pass

---

## Getting Started

### Requirements

- Python 3.11 or higher
- pip (Python package manager)
- A terminal/command prompt
- Optional: Docker (for containerized deployment)

### Quick Start (Development)

```bash
# Navigate to the project
cd central-auth-api

# Create virtual environment
python -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate

# Activate it (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

Once running, open your browser to: **<http://localhost:8000/docs>**

You'll see an interactive API documentation page where you can test all endpoints.

---

## System Features

### 1. User Registration

New users can register through the API. Their account goes into a "pending" state until an admin approves them.

**How it works:**

1. User submits registration form (email, username, password)
2. System creates a pending user record
3. Admin receives notification
4. User waits for approval

### 2. Admin Approval System

Administrators can view pending registrations and approve or reject them.

**Approve:** User becomes active and can log in
**Reject:** User is marked as rejected with a reason

### 3. QR Code Authentication

This is the unique feature that makes this system special.

**The Flow:**

1. A service (like "ServiceB.com") requests a QR code
2. User opens their mobile app and scans the QR
3. Mobile app receives a 6-digit PIN
4. User types the PIN on ServiceB.com
5. ServiceB.com verifies the PIN with the API
6. User is logged in!

**Why this is secure:**

- QR codes expire in 2 minutes
- Each QR can only be scanned once
- The PIN is randomly generated and only known to the mobile app

### 4. Operating Hours

The system can enforce operating hours. If someone tries to login at 2 AM and the system is closed (9 AM - 5 PM), they'll be blocked.

**Current Settings:**

- Opens: 9:00 AM
- Closes: 11:00 PM
- Warning: 15 minutes before closing

---

## Testing the API

### Step 1: Register a Test User

Using the Swagger UI at `/docs` or via curl:

```bash
curl -X POST "http://localhost:8000/api/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123",
    "full_name": "Test User"
  }'
```

**Expected Response:**

```json
{
  "id": 1,
  "email": "test@example.com",
  "username": "testuser",
  "full_name": "Test User",
  "is_reviewed": false,
  "created_at": "2025-12-29T10:00:00"
}
```

### Step 2: Create an Admin (First Time Only)

Run the admin creation script:

```bash
python scripts/create_admin.py
```

Follow the prompts to create your first admin account.

### Step 3: Admin Login

```bash
curl -X POST "http://localhost:8000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourAdminPassword"
  }'
```

**Response includes access token:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "super_admin"
  }
}
```

### Step 4: View Pending Users

```bash
curl "http://localhost:8000/api/admin/pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Approve a User

```bash
curl -X POST "http://localhost:8000/api/admin/approve/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"admin_notes": "Approved for testing"}'
```

---

## API Endpoints Reference

### Registration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register new user |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/qr/generate` | Generate QR code for login |
| POST | `/api/auth/qr/scan` | Process QR scan from mobile |
| POST | `/api/auth/pin/verify` | Verify PIN and create session |
| POST | `/api/auth/validate-session` | Check if session is valid |
| POST | `/api/auth/logout` | End a session |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/pending` | List pending users |
| POST | `/api/admin/approve/{id}` | Approve a user |
| POST | `/api/admin/reject/{id}` | Reject a user |
| GET | `/api/admin/login-history` | View login history |
| GET | `/api/admin/users` | List all active users |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/status` | Get system status |
| GET | `/api/system/operating-hours` | Get operating hours |
| GET | `/health` | Health check |

---

## Configuration

### Environment Variables

All settings are in the `.env` file:

```env
# Database
DATABASE_URL=sqlite:///./auth_system.db

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key-change-this

# Operating Hours
OPENING_HOUR=9
CLOSING_HOUR=23

# Timeouts
QR_CODE_EXPIRY_MINUTES=2
PIN_EXPIRY_MINUTES=5
SESSION_EXPIRY_MINUTES=30
```

### Changing Operating Hours

Edit `.env`:

```env
OPENING_HOUR=6    # Open at 6 AM
CLOSING_HOUR=22   # Close at 10 PM
```

Restart the server for changes to take effect.

---

## Troubleshooting

### "Registration is currently closed"

**Cause:** Current time is outside operating hours.
**Solution:** Check operating hours with `GET /api/system/operating-hours`

### "Invalid token"

**Cause:** JWT token has expired or is malformed.
**Solution:** Login again to get a fresh token.

### "QR code has expired"

**Cause:** More than 2 minutes passed since QR was generated.
**Solution:** Generate a new QR code.

### "Invalid PIN"

**Cause:** Wrong PIN entered, or QR code wasn't scanned yet.
**Solution:** Verify the PIN matches exactly, ensure QR was scanned first.

---

## Security Best Practices

1. **Change the SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Restrict CORS origins** to your actual domains
4. **Enable rate limiting** to prevent brute force
5. **Regularly review login history** for suspicious activity
6. **Use strong admin passwords**

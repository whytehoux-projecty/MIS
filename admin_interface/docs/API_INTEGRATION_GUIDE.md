# Admin Control Center - API Integration Guide

## 📋 Overview

This document outlines all backend API endpoints available for the Admin Control Center to integrate with the Central Auth API for managing users, invitations, services, and system operations.

**Base URL:** `http://localhost` (or your production domain)

---

## 🔐 Authentication

### Admin Login
Although authentication is currently disabled in the frontend, the backend still supports admin authentication:

```
POST /api/admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "super_admin"
  }
}
```

---

## 📧 Invitation Management

### Create Invitation
Generate a new invitation code for prospective members.

```
POST /api/invitation/create
```

**Request Body:**
```json
{
  "intended_for": "john.doe@example.com",
  "notes": "VIP member referral",
  "expires_in_hours": 72,
  "custom_code": null,
  "custom_pin": null
}
```

**Response:**
```json
{
  "id": 1,
  "code": "ABC123XY",
  "pin": "4567",
  "intended_for": "john.doe@example.com",
  "notes": "VIP member referral",
  "is_used": false,
  "used_by": null,
  "created_at": "2024-12-31T00:00:00Z",
  "expires_at": "2025-01-03T00:00:00Z"
}
```

### List All Invitations
```
GET /api/invitation/list?skip=0&limit=50&include_used=false
```

**Query Parameters:**
- `skip` (int): Pagination offset (default: 0)
- `limit` (int): Number of results (default: 50)
- `include_used` (bool): Include used invitations (default: false)

**Response:**
```json
[
  {
    "id": 1,
    "code": "ABC123XY",
    "pin": "4567",
    "intended_for": "john.doe@example.com",
    "notes": "VIP referral",
    "is_used": false,
    "used_by": null,
    "created_at": "2024-12-31T00:00:00Z",
    "expires_at": "2025-01-03T00:00:00Z"
  }
]
```

### Delete Invitation
```
DELETE /api/invitation/{invitation_id}
```

**Response:**
```json
{
  "message": "Invitation deleted successfully"
}
```

### Verify Invitation (Public - for testing)
```
POST /api/invitation/verify
```

**Request Body:**
```json
{
  "invitation_code": "ABC123XY",
  "pin": "4567"
}
```

---

## 👥 User Registration Management

### Get Pending Registrations
Retrieve all users awaiting admin approval.

```
GET /api/admin/pending?skip=0&limit=100
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "newuser@example.com",
    "username": "newuser",
    "full_name": "New User",
    "phone": "+1234567890",
    "is_reviewed": false,
    "created_at": "2024-12-31T00:00:00Z"
  }
]
```

### Approve User Registration
```
POST /api/admin/approve/{user_id}
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "admin_notes": "Approved after verification call"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "newuser@example.com",
  "username": "newuser",
  "full_name": "New User",
  "auth_key": "unique_auth_key_for_mobile_app",
  "is_active": true,
  "created_at": "2024-12-31T00:00:00Z"
}
```

### Reject User Registration
```
POST /api/admin/reject/{user_id}
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "reason": "Insufficient documentation provided"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User 1 has been rejected"
}
```

### Get All Active Users
```
GET /api/admin/users?skip=0&limit=100
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "activeuser",
    "full_name": "Active User",
    "auth_key": "user_auth_key",
    "is_active": true,
    "created_at": "2024-12-31T00:00:00Z"
  }
]
```

---

## 📊 Analytics & History

### Get Login History
```
GET /api/admin/login-history?user_id=1&service_id=1&skip=0&limit=100
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `user_id` (int, optional): Filter by user
- `service_id` (int, optional): Filter by service
- `skip` (int): Pagination offset
- `limit` (int): Results per page

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "service_id": 2,
    "login_at": "2024-12-31T10:00:00Z",
    "logout_at": null,
    "session_expires_at": "2024-12-31T10:30:00Z"
  }
]
```

### Get User Statistics
```
GET /api/admin/user-stats/{user_id}
```

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "total_logins": 45,
  "services_used": 3,
  "last_login": "2024-12-31T10:00:00Z",
  "first_login": "2024-01-01T08:00:00Z"
}
```

---

## 🔧 Service Management

### Register New Service
Register a new application/service to use the auth system.

```
POST /api/services/register
```

**Request Body:**
```json
{
  "service_name": "My App",
  "service_url": "https://myapp.com",
  "description": "Customer portal application"
}
```

**Response:**
```json
{
  "id": 1,
  "service_name": "My App",
  "service_url": "https://myapp.com",
  "api_key": "generated_api_key_for_service",
  "description": "Customer portal application",
  "is_active": true,
  "created_at": "2024-12-31T00:00:00Z"
}
```

### List All Services
```
GET /api/services/list?include_inactive=false
```

**Response:**
```json
[
  {
    "id": 1,
    "service_name": "Service B",
    "service_url": "https://serviceb.com",
    "api_key": "api_key_here",
    "description": "Main portal",
    "is_active": true,
    "created_at": "2024-12-31T00:00:00Z"
  }
]
```

### Deactivate Service
```
POST /api/services/deactivate/{service_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Service 1 deactivated"
}
```

---

## ⚙️ System Management

### Get System Status
```
GET /api/system/status
```

**Response:**
```json
{
  "status": "open",
  "message": "System is open",
  "warning": false,
  "current_time": "2024-12-31T10:00:00Z"
}
```

### Get Operating Hours
```
GET /api/system/operating-hours
```

**Response:**
```json
{
  "opening_time": "09:00",
  "closing_time": "17:00",
  "warning_minutes_before_close": 15,
  "timezone": "UTC",
  "currently_open": true
}
```

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "api_version": "1.0.0",
  "system": {
    "status": "open",
    "message": "System is open",
    "warning": false
  }
}
```

---

## 🔑 Registration (Public Endpoints)

### Check Email Availability
```
GET /api/register/check-email?email=user@example.com
```

**Response:**
```json
{
  "available": true,
  "message": "Email is available"
}
```

### Check Username Availability
```
GET /api/register/check-username?username=newuser
```

**Response:**
```json
{
  "available": false,
  "message": "This username is already taken"
}
```

### Register New User
```
POST /api/register/
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePassword123!",
  "full_name": "New User",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "newuser@example.com",
  "username": "newuser",
  "full_name": "New User",
  "phone": "+1234567890",
  "is_reviewed": false,
  "created_at": "2024-12-31T00:00:00Z"
}
```

---

## 🎯 Admin Control Center Features to Implement

### 1. Dashboard
- System status widget (open/closed)
- Operating hours display
- Quick stats (pending users, active users, active sessions)
- Recent activity feed

### 2. Invitation Management
- Create new invitations with optional intended recipient
- View all invitations (filter by used/unused)
- Copy invitation code/PIN to clipboard
- Delete unused invitations
- Bulk invitation generation

### 3. User Approval Workflow
- List all pending registrations
- View user details before approval
- Approve with optional notes
- Reject with required reason
- Send notification on approval/rejection

### 4. Active Users Management
- List all active users
- View user statistics and login history
- Deactivate/reactivate users
- View user's associated services

### 5. Service Management
- Register new services
- View service API keys
- Generate new API keys
- Deactivate services
- View per-service login statistics

### 6. Analytics
- Login history by user/service/date
- User activity trends
- Service usage metrics
- Registration approval/rejection rates

### 7. System Settings
- View/modify operating hours
- System health monitoring
- API rate limit status

---

## 🔄 API Service Implementation Example

```typescript
// services/apiService.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export const adminApi = {
  // Invitations
  createInvitation: (data: CreateInvitationRequest) =>
    fetch(`${API_BASE_URL}/api/invitation/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  listInvitations: (includeUsed = false) =>
    fetch(`${API_BASE_URL}/api/invitation/list?include_used=${includeUsed}`)
      .then(res => res.json()),

  deleteInvitation: (id: number) =>
    fetch(`${API_BASE_URL}/api/invitation/${id}`, { method: 'DELETE' })
      .then(res => res.json()),

  // User Management
  getPendingUsers: (skip = 0, limit = 100) =>
    fetch(`${API_BASE_URL}/api/admin/pending?skip=${skip}&limit=${limit}`)
      .then(res => res.json()),

  approveUser: (userId: number, notes?: string) =>
    fetch(`${API_BASE_URL}/api/admin/approve/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    }).then(res => res.json()),

  rejectUser: (userId: number, reason: string) =>
    fetch(`${API_BASE_URL}/api/admin/reject/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }).then(res => res.json()),

  getAllUsers: (skip = 0, limit = 100) =>
    fetch(`${API_BASE_URL}/api/admin/users?skip=${skip}&limit=${limit}`)
      .then(res => res.json()),

  // Services
  registerService: (data: RegisterServiceRequest) =>
    fetch(`${API_BASE_URL}/api/services/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  listServices: (includeInactive = false) =>
    fetch(`${API_BASE_URL}/api/services/list?include_inactive=${includeInactive}`)
      .then(res => res.json()),

  // System
  getSystemStatus: () =>
    fetch(`${API_BASE_URL}/api/system/status`).then(res => res.json()),

  getOperatingHours: () =>
    fetch(`${API_BASE_URL}/api/system/operating-hours`).then(res => res.json()),

  healthCheck: () =>
    fetch(`${API_BASE_URL}/health`).then(res => res.json()),
};
```

---

## ⚠️ Important Notes

1. **Rate Limiting**: The API has rate limiting on sensitive endpoints:
   - Login: 5 requests per 60 seconds
   - Registration: 3 requests per 300 seconds
   - QR/Invitations: 5-20 requests per 60 seconds

2. **Operating Hours**: Some endpoints only work during configured operating hours (9:00-17:00 UTC by default)

3. **Admin Authentication**: Most `/api/admin/*` endpoints require the `Authorization: Bearer {token}` header (currently bypassed in frontend)

4. **CORS**: The API allows requests from all origins (`*`) in the current configuration

---

## 📦 Environment Variables

The admin control should use these environment variables:

```env
VITE_API_BASE_URL=http://localhost
VITE_APP_NAME=Admin Control Center
```

For production:
```env
VITE_API_BASE_URL=https://your-production-domain.com
VITE_APP_NAME=Admin Control Center
```

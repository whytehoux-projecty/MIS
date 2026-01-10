# 🚀 Deployment Checklist

> **Document:** 10_DEPLOYMENT_CHECKLIST.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## Pre-Deployment

### 1. Code Review

- [ ] All code changes reviewed and approved
- [ ] No console.log or print statements in production code
- [ ] All TODO comments addressed or tracked
- [ ] Security review completed

### 2. Database

- [ ] Backup current database
- [ ] Test migrations on staging
- [ ] Migration scripts ready
- [ ] Rollback scripts prepared

### 3. Configuration

- [ ] Environment variables updated:
  - [ ] `URL_ENCRYPTION_KEY` - Generate secure key
  - [ ] `REGISTRATION_PORTAL_URL` - Production URL
  - [ ] `INVITATION_VALIDITY_HOURS` - Set to 24
  - [ ] `SESSION_VALIDITY_HOURS` - Set to 5
  - [ ] `SMTP_*` - Email configuration

### 4. Email Templates

- [ ] Email templates deployed to templates directory
- [ ] Template variables tested
- [ ] Email delivery verified

---

## Deployment Steps

### Phase 1: Backend Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
cd backend_api
pip install -r requirements.txt

# 3. Run migrations
alembic upgrade head

# 4. Restart service
sudo systemctl restart mis-backend
# or
docker-compose restart backend

# 5. Verify health
curl http://localhost:8000/health
```

### Phase 2: Admin Interface Deployment

```bash
# 1. Pull latest code
cd admin_interface

# 2. Install dependencies
npm ci

# 3. Build production
npm run build

# 4. Deploy to server
# (depends on hosting setup)
```

### Phase 3: Registration Portal Deployment

```bash
# 1. Pull latest code
cd registration_portal

# 2. Install dependencies
npm ci

# 3. Build production
npm run build

# 4. Deploy to server
# (depends on hosting setup)
```

---

## Post-Deployment Verification

### 1. Backend Checks

- [ ] API health endpoint responds: `GET /health`
- [ ] Interest submit endpoint works: `POST /api/interest/submit`
- [ ] Invitation verify endpoint works: `POST /api/invitation/verify`
- [ ] Admin endpoints require authentication

### 2. Frontend Checks

- [ ] Registration portal loads at correct URL
- [ ] `/r/:token` route works correctly
- [ ] Invitation verification form accepts new format
- [ ] Session timer displays correctly
- [ ] Admin interface loads and connects to API

### 3. Email Checks

- [ ] Invitation approval email sends
- [ ] Email contains correct code format (15 chars)
- [ ] Email contains correct PIN format (6 digits)
- [ ] Registration link works
- [ ] Rejection email sends

### 4. Flow Verification

- [ ] Complete external application flow
- [ ] Complete admin invite flow
- [ ] Verify session timer (can use shortened test duration)
- [ ] Verify link expiry handling

---

## Environment Variables

### Backend (`backend_api/.env`)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/mis

# JWT
JWT_SECRET_KEY=your-super-secret-key
JWT_ALGORITHM=HS256

# URL Encryption
URL_ENCRYPTION_KEY=your-32-byte-base64-key

# Registration Portal
REGISTRATION_PORTAL_URL=https://register.mis.net

# Timer Settings
INVITATION_VALIDITY_HOURS=24
SESSION_VALIDITY_HOURS=5

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@mis.net
SMTP_PASSWORD=your-email-password
SMTP_TLS=true
EMAIL_FROM=MIS Registration <noreply@mis.net>
```

### Admin Interface (`admin_interface/.env`)

```env
VITE_API_BASE_URL=https://api.mis.net
```

### Registration Portal (`registration_portal/.env`)

```env
VITE_API_BASE_URL=https://api.mis.net
```

---

## Rollback Procedure

### If Something Goes Wrong

```bash
# 1. Rollback database migration
cd backend_api
alembic downgrade -1

# 2. Redeploy previous code version
git checkout <previous-commit>

# 3. Restart services
docker-compose restart

# 4. Verify previous functionality
```

---

## Monitoring

### Key Metrics to Watch

- Interest request submission rate
- Invitation approval rate
- Verification success/failure rate
- Session expiry rate
- Email delivery rate

### Log Locations

- Backend: `/var/log/mis/backend.log`
- Nginx: `/var/log/nginx/access.log`
- Email: Check SMTP service logs

---

## Emergency Contacts

| Role | Contact |
|------|---------|
| Backend Lead | [Contact Info] |
| Frontend Lead | [Contact Info] |
| DevOps | [Contact Info] |
| Project Manager | [Contact Info] |

---

## Sign-Off

| Stage | Approved By | Date | Notes |
|-------|-------------|------|-------|
| Code Review | | | |
| Staging Test | | | |
| Production Deploy | | | |
| Post-Deploy Verify | | | |

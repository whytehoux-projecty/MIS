# MIS Registration Portal

> Secure Membership Registration Portal with Member Dashboard

## Overview

This is the **MIS Registration Portal** - a secure, Docker-deployed application for membership registration and member management. It is now integrated into the **MIS_SYSTEM-ENGINE** ecosystem and shares the same Docker compose stack with:

- **Central Auth API** - Backend authentication and registration services
- **Admin UI** - Admin control center for managing members
- **Nginx** - Reverse proxy handling all routing
- **Ngrok** - Public tunnel for external access

### Features

1. **Invitation Verification** - Validate invitation codes
2. **Registration Flow** - Complete 4-step registration process
3. **Oath Recording** - Audio oath with policy acceptance
4. **Member Dashboard** - View application status and profile
5. **Completion** - Confirmation and reference number

## Ecosystem Integration

This portal is part of the MIS_SYSTEM-ENGINE ecosystem and is deployed via the main `docker-compose.prod.yml` located in `central-auth-api/`.

### Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   MIS_SYSTEM-ENGINE Ecosystem                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│   │ Central Auth   │  │   Admin UI     │  │  Registration  │  │
│   │     API        │  │   (Port 3000)  │  │    Portal      │  │
│   │  (Port 8000)   │  │                │  │  (Port 4000)   │  │
│   └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  │
│           │                   │                   │            │
│           └───────────────────┼───────────────────┘            │
│                               │                                │
│                       ┌───────▼────────┐                       │
│                       │     Nginx      │                       │
│                       │ (Reverse Proxy)│                       │
│                       │  80/3000/4000  │                       │
│                       └───────┬────────┘                       │
│                               │                                │
│                       ┌───────▼────────┐                       │
│                       │     Ngrok      │                       │
│                       │ (Public Tunnel)│                       │
│                       │   Port 4040    │                       │
│                       └────────────────┘                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Ports

| Service | Internal Port | Exposed Port | Purpose |
|---------|--------------|--------------|---------|
| Central Auth API | 8000 | 80 (via nginx) | Backend API |
| Admin UI | 80 | 3000 (via nginx) | Admin dashboard |
| Registration Portal | 80 | 4000 (via nginx) | Public registration |
| Ngrok | - | 4040 | Tunnel dashboard |

## Quick Start

### As Part of Ecosystem (Recommended)

Deploy with the full ecosystem:

```bash
# Navigate to central-auth-api directory
cd ../central-auth-api

# Set up environment (add NGROK_AUTHTOKEN)
cp .env.production.example .env.production
# Edit .env.production and add your NGROK_AUTHTOKEN

# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f registration-portal

# Get ngrok public URL
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1
```

### Local Development (Standalone)

For local development without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The portal will be available at `http://localhost:5173`

## Environment Variables

Environment variables are managed in the ecosystem's main configuration:

| Variable | Location | Description |
|----------|----------|-------------|
| `NGROK_AUTHTOKEN` | `central-auth-api/.env.production` | Ngrok authentication token |
| `VITE_API_BASE_URL` | Build arg in Dockerfile | API URL (set to `/api` for nginx proxy) |
| `ALLOWED_ORIGINS` | `central-auth-api/.env.production` | CORS allowed origins |

## Project Structure

```
registration-portal/
├── src/
│   ├── assets/          # Images and resources
│   ├── components/      # Full UI component library
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Registration pages + Dashboard
│   │   ├── InvitationPage.tsx
│   │   ├── RegistrationPage.tsx
│   │   ├── OathPage.tsx
│   │   ├── CompletePage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/        # API service
│   ├── types/           # TypeScript types
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── Dockerfile           # Docker build configuration
├── nginx.conf           # Nginx config (used inside container)
├── .env.example         # Environment template
└── package.json
```

## API Integration

The portal communicates with the Central Auth API through nginx proxying:

| Endpoint | Purpose |
|----------|---------|
| `/api/invitation/verify` | Verify invitation |
| `/api/register/` | Submit registration |
| `/api/register/check-email` | Check email availability |
| `/api/register/check-username` | Check username availability |
| `/api/upload/photo` | Upload photos |
| `/api/upload/oath` | Upload oath recording |
| `/api/register/submit` | Complete submission |
| `/api/health` | Health check |

## Ngrok Integration

### Getting Ngrok Auth Token

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your auth token from the dashboard
3. Add it to `central-auth-api/.env.production`

### Ngrok Dashboard

Access the Ngrok web interface at `http://localhost:4040` to:

- View the public URL
- Inspect HTTP requests
- Monitor traffic

### Get Current Ngrok URL

```bash
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1
```

## Troubleshooting

### Common Issues

**Ngrok URL Changes:** Consider using Ngrok reserved domains (paid feature) for persistent URLs.

**CORS Errors:** Verify the CORS headers are correctly configured in the main nginx config at `central-auth-api/nginx/nginx.conf`.

**Health Check Fails:**

```bash
# Check container status
docker ps

# Test health endpoint
curl http://localhost:4000/health
```

## Security

- All routes require invitation verification
- Session management with 3-hour timeout
- HTTPS enforced via Ngrok
- Rate limiting configured in nginx
- CORS configured for specific origins

---

**Version:** 1.0.0  
**Last Updated:** January 4, 2026  
**Ecosystem:** MIS_SYSTEM-ENGINE

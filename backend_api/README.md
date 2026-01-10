# MIS Backend API

Central Authentication Service for the MIS System.
Built with FastAPI, SQLAlchemy, and PostgreSQL.

## Features

- **QR Code Authentication**: Secure login flow using mobile app scanning.
- **Biometric Support**: Backend storage for biometric enable flags.
- **Device Fingerprinting**: Captures device metadata during QR scans for security audits.
- **Rate Limiting**: Advanced IP-based rate limiting with temporary blocking and progressive delays.
- **Audit Logging**: Comprehensive security audit logging for all auth events (QR gen/scan, PIN verify, Logout).

## Tech Stack

- Python 3.9+
- FastAPI
- PostgreSQL & SQLAlchemy
- Alembic (Migrations)
- Pydantic

## Setup

1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Run Migrations: `alembic upgrade head`
5. Start Server: `uvicorn app.main:app --reload`

## Security

- **Rate Limiting**: Configured in `app/middleware/rate_limiter.py`.
- **Audit Logs**: Stored in `logs/security_audit.log`.

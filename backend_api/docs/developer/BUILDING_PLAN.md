# Central-Auth-API: Complete Building Plan

## Phase 1: Security Hardening (Priority: Critical)

### 1.1 Create Auth Dependencies

**File:** `app/core/dependencies.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models.active_user import ActiveUser
from app.models.admin import Admin

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> ActiveUser:
    """
    Dependency to get current authenticated user from JWT token.
    Use this to protect user-facing endpoints.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(ActiveUser).filter(
        ActiveUser.id == user_id,
        ActiveUser.is_active == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Dependency to get current authenticated admin from JWT token.
    Use this to protect admin-only endpoints.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    admin_id = payload.get("id")
    admin = db.query(Admin).filter(
        Admin.id == admin_id,
        Admin.is_active == True
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found or inactive"
        )
    
    return admin

def require_super_admin(admin: Admin = Depends(get_current_admin)) -> Admin:
    """Require super admin privileges"""
    if not admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return admin
```

### 1.2 Create Rate Limiter Middleware

**File:** `app/middleware/rate_limiter.py`

```python
from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def check_rate_limit(self, request: Request):
        client_ip = request.client.host
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        async with self._lock:
            # Clean old requests
            self.requests[client_ip] = [
                t for t in self.requests[client_ip] 
                if t > window_start
            ]
            
            if len(self.requests[client_ip]) >= self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests. Try again in {self.window_seconds} seconds."
                )
            
            self.requests[client_ip].append(now)

# Create instances for different endpoints
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=60)
register_rate_limiter = RateLimiter(max_requests=3, window_seconds=300)
qr_rate_limiter = RateLimiter(max_requests=20, window_seconds=60)
```

### 1.3 Fix PIN Generator

**File:** `app/utils/pin_generator.py` (Replace content)

```python
import secrets

def generate_pin(length: int = 6) -> str:
    """
    Generate a cryptographically secure random PIN.
    
    Args:
        length: Number of digits (default 6)
    
    Returns:
        String of random digits
    """
    max_value = 10 ** length
    return f"{secrets.randbelow(max_value):0{length}d}"
```

---

## Phase 2: Middleware Integration

### 2.1 Update Main Application

**File:** `app/main.py` (Modifications)

Add these imports and middleware:

```python
from app.middleware.rate_limiter import login_rate_limiter
from app.config import settings

# Update CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)
```

### 2.2 Update Config

**File:** `app/config.py` (Add these settings)

```python
# Add to Settings class
ALLOWED_ORIGINS: list = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://localhost:5173"
).split(",")

# Production settings
PRODUCTION: bool = os.getenv("PRODUCTION", "False") == "True"

# Rate limiting
RATE_LIMIT_LOGIN: int = int(os.getenv("RATE_LIMIT_LOGIN", "5"))
RATE_LIMIT_REGISTER: int = int(os.getenv("RATE_LIMIT_REGISTER", "3"))
```

---

## Phase 3: Testing Suite

### 3.1 Test Configuration

**File:** `tests/conftest.py`

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

### 3.2 Registration Tests

**File:** `tests/test_registration.py`

```python
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
```

---

## Phase 4: Production Deployment

### 4.1 Docker Production Setup

**File:** `Dockerfile.prod`

```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application
COPY app/ ./app/
COPY scripts/ ./scripts/

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Create directories
RUN mkdir -p logs data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 4.2 Nginx Configuration for Reverse Proxy

**File:** `nginx/nginx.conf`

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain application/json application/javascript;
    
    # Upstream API server
    upstream api_backend {
        server auth-api:8000;
        keepalive 32;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    server {
        listen 80;
        server_name _;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        location / {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Health check endpoint (no rate limiting)
        location /health {
            proxy_pass http://api_backend/health;
            proxy_http_version 1.1;
        }
    }
}
```

### 4.3 Complete docker-compose.prod.yml

**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  auth-api:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: central-auth-api
    expose:
      - "8000"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - DATABASE_URL=sqlite:///./data/auth_system.db
      - PRODUCTION=True
      - DEBUG_MODE=False
    env_file:
      - .env.production
    restart: unless-stopped
    networks:
      - auth-network
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: auth-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      auth-api:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - auth-network

networks:
  auth-network:
    driver: bridge
```

---

## Phase 5: Implementation Timeline

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | Security hardening | Dependencies, rate limiter, fixed PIN |
| 1 | Config updates | CORS, environment variables |
| 2 | Protected routes | All admin routes secured |
| 2 | Testing suite | 80% code coverage |
| 3 | Docker production setup | Production-ready containers |
| 3 | Nginx configuration | Reverse proxy ready |
| 4 | Integration testing | Full end-to-end tests |
| 4 | Documentation | API docs, deployment guide |

---

## Deployment Commands

### Local Development

```bash
# Start development server
cd central-auth-api
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Docker Development

```bash
docker-compose up -d --build
```

### Production Deployment

```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Expose to Internet (ngrok for testing)

```bash
# Install ngrok
brew install ngrok

# Expose port 80
ngrok http 80

# Use the provided URL for admin_control and client
```

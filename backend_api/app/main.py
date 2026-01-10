# ============================================================================ 
# FILE: app/main.py (UPDATED VERSION) 
# PURPOSE: Complete FastAPI application with all routes integrated 
# ============================================================================ 

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.config import settings
from app.database import engine, Base
from app.core.system_status import get_system_status

# Import all route modules
from app.routes import registration, admin, auth, services, system, invitation, waitlist, upload, monitoring

# Import all models to ensure they're registered with SQLAlchemy
from app.models import waitlist as waitlist_model  # noqa: F401

# Create all database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database table creation failed (might already exist): {e}")

# Initialize FastAPI application
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="""
    Central Authentication API
    
    This API provides centralized authentication for multiple services using QR code + PIN verification.
    
    ## Features
    - User registration with admin approval
    - QR code-based authentication
    - Session management
    - Login history tracking
    - Operating hours enforcement
    
    ## Authentication Flow
    1. User registers on Website A → Goes to pending approval
    2. Admin approves user → User becomes active
    3. ServiceB requests QR code → System generates QR and token
    4. User scans QR with mobile app → System generates PIN
    5. User enters PIN on ServiceB → System creates session token
    6. ServiceB validates session → User is logged in
    """,
    debug=settings.DEBUG_MODE
)

# Configure CORS to allow web and mobile apps to connect
# Configure CORS to allow web and mobile apps to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# Mount uploads directory to serve images/audio
# Ensure the directory exists to avoid startup errors
import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
    
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register all route modules with their prefixes
app.include_router(
    registration.router,
    prefix="/api/register",
    tags=["Registration"]
)

app.include_router(
    admin.router,
    prefix="/api/admin",
    tags=["Admin"]
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    services.router,
    prefix="/api/services",
    tags=["Services"]
)

app.include_router(
    system.router,
    prefix="/api/system",
    tags=["System"]
)

app.include_router(
    monitoring.router,
    prefix="/api/monitoring",
    tags=["Monitoring"]
)

app.include_router(
    invitation.router,
    prefix="/api/invitation",
    tags=["Invitation"]
)

app.include_router(
    waitlist.router,
    prefix="/api/waitlist",
    tags=["Waitlist"]
)

app.include_router(
    upload.router,
    prefix="/api/upload",
    tags=["Uploads"]
)

from pathlib import Path


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 404 and Path(path).suffix == "":
            return await super().get_response("index.html", scope)
        return response


admin_dist_dir = Path(__file__).resolve().parent.parent / "admin-ui" / "dist"


@app.get("/admin", include_in_schema=False)
def admin_redirect():
    return RedirectResponse(url="/admin/")


if admin_dist_dir.exists():
    app.mount("/admin", SPAStaticFiles(directory=str(admin_dist_dir), html=True), name="admin")

# Function to seed default admin user
def seed_default_admin():
    """Create default admin user if none exists"""
    from app.database import SessionLocal
    from app.models.admin import Admin
    from app.core.security import hash_password
    
    db = SessionLocal()
    try:
        # Check if any admin exists
        existing_admin = db.query(Admin).first()
        if existing_admin:
            print("✅ Admin user already exists")
            return
        
        # Create default admin with credentials: admin / Admin@123456
        default_admin = Admin(
            username="admin",
            email="admin@system.local",
            full_name="System Administrator",
            hashed_password=hash_password("Admin@123456"),
            is_super_admin=True,
            is_active=True
        )
        
        db.add(default_admin)
        db.commit()
        print("🔑 Default admin user created:")
        print("   Username: admin")
        print("   Password: Admin@123456")
        print("   ⚠️  Please change the password after first login!")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not seed default admin: {e}")
        db.rollback()
    finally:
        db.close()


from app.core.logging_config import setup_logging

# Startup event - runs when server starts
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    setup_logging()
    print("=" * 60)
    print(f"🚀 {settings.API_TITLE} v{settings.API_VERSION}")
    print("=" * 60)
    
    # Seed default admin user if none exists
    seed_default_admin()
    
    status = get_system_status()
    print(f"📊 System Status: {status['status'].upper()}")
    print(f"💬 {status['message']}")
    
    if settings.DEBUG_MODE:
        print("⚠️  DEBUG MODE IS ENABLED")
    
    print(f"🌐 API Documentation: http://localhost:8000/docs")
    print(f"📖 Alternative Docs: http://localhost:8000/redoc")
    print("=" * 60)

# Shutdown event - runs when server stops
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\n" + "=" * 60)
    print("🛑 Shutting down Central Auth API...")
    print("💾 Closing database connections...")
    print("✅ Shutdown complete")
    print("=" * 60)

# Root endpoint
@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint - API information
    """
    status = get_system_status()
    
    return {
        "message": f"Welcome to {settings.API_TITLE}",
        "version": settings.API_VERSION,
        "system_status": status,
        "endpoints": {
            "documentation": "/docs",
            "alternative_docs": "/redoc",
            "health_check": "/health",
            "system_status": "/api/system/status"
        }
    }

# Health check endpoint
@app.get("/health", tags=["Root"])
def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "api_version": settings.API_VERSION,
        "system": get_system_status()
    }

# Run the application (for development)
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )

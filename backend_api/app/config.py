import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./auth_system.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Operating Hours
    OPENING_HOUR: int = int(os.getenv("OPENING_HOUR", "9"))
    OPENING_MINUTE: int = int(os.getenv("OPENING_MINUTE", "0"))
    CLOSING_HOUR: int = int(os.getenv("CLOSING_HOUR", "17"))
    CLOSING_MINUTE: int = int(os.getenv("CLOSING_MINUTE", "0"))
    WARNING_MINUTES: int = int(os.getenv("WARNING_MINUTES_BEFORE_CLOSE", "15"))
    
    # Session Settings
    QR_CODE_EXPIRY_MINUTES: int = int(os.getenv("QR_CODE_EXPIRY_MINUTES", "2"))
    PIN_EXPIRY_MINUTES: int = int(os.getenv("PIN_EXPIRY_MINUTES", "5"))
    SESSION_EXPIRY_MINUTES: int = int(os.getenv("SESSION_EXPIRY_MINUTES", "30"))
    
    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    
    # API
    API_TITLE: str = os.getenv("API_TITLE", "Central Auth API")
    API_VERSION: str = os.getenv("API_VERSION", "1.0.0")
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "True") == "True"

    # Production
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:5173"
    ).split(",")
    PRODUCTION: bool = os.getenv("PRODUCTION", "False") == "True"

    # Rate limiting
    RATE_LIMIT_LOGIN: int = int(os.getenv("RATE_LIMIT_LOGIN", "5"))
    RATE_LIMIT_REGISTER: int = int(os.getenv("RATE_LIMIT_REGISTER", "3"))

settings = Settings()
import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    """Configure application and audit logging with rotation."""
    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)s | %(name)s | %(message)s'
    )
    
    # 1. Security Audit Log (Rotated daily/size)
    audit_logger = logging.getLogger("security.audit")
    audit_logger.setLevel(logging.INFO)
    audit_logger.propagate = False # value dependent on root logger config, usually safe to separate
    
    if not audit_logger.handlers:
        audit_handler = RotatingFileHandler(
            "logs/security_audit.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=30          # Keep 30 backup files
        )
        audit_handler.setFormatter(formatter)
        audit_logger.addHandler(audit_handler)
    
    # 2. General Application Log
    app_logger = logging.getLogger("app")
    app_logger.setLevel(logging.INFO)
    
    if not app_logger.handlers:
        app_handler = RotatingFileHandler(
            "logs/application.log",
            maxBytes=10*1024*1024,
            backupCount=7
        )
        app_handler.setFormatter(formatter)
        app_logger.addHandler(app_handler)
    
    # Ensure root logger also logs to file or console
    logging.basicConfig(level=logging.INFO)

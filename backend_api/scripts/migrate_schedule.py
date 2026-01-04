"""
Database migration script to create system_schedule tables
Run this to add schedule management to existing database
"""
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auth_system.db")
engine = create_engine(DATABASE_URL)

def migrate():
    """Create system_schedule and system_schedule_audit tables"""
    
    with engine.connect() as conn:
        # Create system_schedule table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS system_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                opening_hour INTEGER NOT NULL DEFAULT 9,
                opening_minute INTEGER NOT NULL DEFAULT 0,
                closing_hour INTEGER NOT NULL DEFAULT 17,
                closing_minute INTEGER NOT NULL DEFAULT 0,
                warning_minutes INTEGER NOT NULL DEFAULT 15,
                timezone VARCHAR NOT NULL DEFAULT 'UTC',
                is_manually_overridden BOOLEAN DEFAULT 0,
                manual_status VARCHAR,
                override_reason VARCHAR,
                override_expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_by INTEGER,
                FOREIGN KEY (updated_by) REFERENCES admins(id)
            )
        """))
        
        # Create system_schedule_audit table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS system_schedule_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER NOT NULL,
                action VARCHAR NOT NULL,
                old_value TEXT,
                new_value TEXT,
                reason VARCHAR,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES admins(id)
            )
        """))
        
        # Create index on audit timestamp
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_schedule_audit_timestamp 
            ON system_schedule_audit(timestamp DESC)
        """))
        
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("   - Created system_schedule table")
        print("   - Created system_schedule_audit table")
        print("   - Created audit timestamp index")
        
        # Check if we need to seed initial data
        result = conn.execute(text("SELECT COUNT(*) FROM system_schedule"))
        count = result.scalar()
        
        if count == 0:
            # Seed initial schedule from environment variables
            opening_hour = int(os.getenv("OPENING_HOUR", "9"))
            opening_minute = int(os.getenv("OPENING_MINUTE", "0"))
            closing_hour = int(os.getenv("CLOSING_HOUR", "17"))
            closing_minute = int(os.getenv("CLOSING_MINUTE", "0"))
            warning_minutes = int(os.getenv("WARNING_MINUTES_BEFORE_CLOSE", "15"))
            
            conn.execute(text("""
                INSERT INTO system_schedule 
                (opening_hour, opening_minute, closing_hour, closing_minute, warning_minutes, timezone)
                VALUES (:oh, :om, :ch, :cm, :wm, 'UTC')
            """), {
                "oh": opening_hour,
                "om": opening_minute,
                "ch": closing_hour,
                "cm": closing_minute,
                "wm": warning_minutes
            })
            
            conn.commit()
            
            print(f"✅ Seeded initial schedule: {opening_hour:02d}:{opening_minute:02d} - {closing_hour:02d}:{closing_minute:02d} UTC")
        else:
            print(f"ℹ️  Schedule already exists ({count} record(s))")

if __name__ == "__main__":
    print("=" * 60)
    print("System Schedule Migration")
    print("=" * 60)
    migrate()
    print("=" * 60)

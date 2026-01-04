import sys
sys.path.append('.')

from app.database import Base, engine

def init_database():
    """Create all database tables"""
    print("🔨 Creating database tables...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        print("\nCreated tables:")
        print("  - pending_users")
        print("  - active_users")
        print("  - admins")
        print("  - registered_services")
        print("  - qr_sessions")
        print("  - login_history")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    init_database()
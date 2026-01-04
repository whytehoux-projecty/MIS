import sys
sys.path.append('.')

from app.database import SessionLocal
from app.models.admin import Admin
from app.core.security import hash_password

def create_admin_account():
    """Create initial admin account"""
    print("👤 Creating admin account...")
    print()
    
    # Get admin details
    username = input("Admin username: ") or "admin"
    email = input("Admin email: ") or "admin@example.com"
    full_name = input("Admin full name: ") or "System Administrator"
    password = input("Admin password: ") or "admin123"
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing = db.query(Admin).filter(Admin.username == username).first()
        if existing:
            print(f"❌ Admin with username '{username}' already exists!")
            return False
        
        # Create admin
        admin = Admin(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_super_admin=True,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        
        print()
        print("✅ Admin account created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print("   ⚠️  Please change the password after first login!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_account()
import sys
sys.path.append('.')

from scripts.init_db import init_database
from scripts.create_admin import create_admin_account
from scripts.seed_services import seed_services

def complete_setup():
    """Run complete initial setup"""
    print("=" * 60)
    print("🎯 CENTRAL AUTH API - COMPLETE SETUP")
    print("=" * 60)
    
    # Step 1: Initialize database
    print("\nStep 1: Initialize Database")
    print("-" * 60)
    if not init_database():
        print("❌ Setup failed at database initialization")
        return False
    
    # Step 2: Create admin account
    print("\nStep 2: Create Admin Account")
    print("-" * 60)
    if not create_admin_account():
        print("⚠️  Admin creation failed, but continuing...")
    
    # Step 3: Seed services
    print("\nStep 3: Seed Example Services")
    print("-" * 60)
    seed_services()
    
    # Complete
    print("\n" + "=" * 60)
    print("✅ SETUP COMPLETE!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("  1. Review your .env file configuration")
    print("  2. Run: python scripts/run_local.py")
    print("  3. Visit: http://localhost:8000/docs")
    print("  4. Test the API endpoints")
    print("\n🎉 You're ready to go!")
    
    return True

if __name__ == "__main__":
    complete_setup()

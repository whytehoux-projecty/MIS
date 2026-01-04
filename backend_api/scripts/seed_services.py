import sys
sys.path.append('.')

from app.database import SessionLocal
from app.services.service_management import register_new_service

def seed_services():
    """Add example services to the database"""
    print("🌱 Seeding example services...")
    
    db = SessionLocal()
    
    services = [
        {
            "service_name": "ServiceB Dashboard",
            "service_url": "https://serviceb.example.com",
            "description": "Main business dashboard application"
        },
        {
            "service_name": "AppC Analytics",
            "service_url": "https://appc.example.com",
            "description": "Analytics and reporting platform"
        },
        {
            "service_name": "Portal D",
            "service_url": "https://portald.example.com",
            "description": "Customer portal"
        }
    ]
    
    try:
        for service_data in services:
            try:
                service = register_new_service(
                    service_name=service_data["service_name"],
                    service_url=service_data["service_url"],
                    description=service_data["description"],
                    db=db
                )
                
                print(f"✅ Created: {service.service_name}")
                print(f"   API Key: {service.api_key}")
                print()
                
            except ValueError as e:
                print(f"⚠️  Skipped: {service_data['service_name']} - {e}")
        
        print("✅ Services seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding services: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_services()
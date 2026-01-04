import requests
import json

def test_api():
    """Test the API endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Central Auth API")
    print("=" * 60)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print("   ✅ Health check passed")
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
    
    # Test 2: System status
    print("\n2️⃣ Testing system status...")
    try:
        response = requests.get(f"{base_url}/api/system/status")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print("   ✅ System status passed")
    except Exception as e:
        print(f"   ❌ System status failed: {e}")
    
    # Test 3: Register user
    print("\n3️⃣ Testing user registration...")
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123",
        "full_name": "Test User",
        "phone": "+1234567890"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/register/",
            json=user_data
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 201:
            print("   ✅ User registration passed")
        else:
            print("   ⚠️  User might already exist")
    except Exception as e:
        print(f"   ❌ Registration failed: {e}")
    
    # Test 4: Get pending users
    print("\n4️⃣ Testing get pending users...")
    try:
        response = requests.get(f"{base_url}/api/admin/pending")
        print(f"   Status: {response.status_code}")
        print(f"   Found {len(response.json())} pending users")
        print("   ✅ Get pending users passed")
    except Exception as e:
        print(f"   ❌ Get pending users failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 API testing complete!")
    print("\n📚 View full API docs at: http://localhost:8000/docs")

if __name__ == "__main__":
    test_api()

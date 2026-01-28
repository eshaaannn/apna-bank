"""
Complete setup script: Create user in Supabase Auth + Database + Get Token
"""

from supabase import create_client
from config import settings
import uuid

def setup_test_user():
    """Create test user and get JWT token."""
    
    # Create Supabase clients
    client = create_client(settings.supabase_url, settings.supabase_key)
    service_client = create_client(settings.supabase_url, settings.supabase_service_key)
    
    email = "test@example.com"
    password = "password123"
    
    print("\n" + "="*60)
    print("🔧 Setting up test user for Voice Banking API")
    print("="*60)
    
    # Step 1: Create auth user (using service role)
    print("\n📝 Step 1: Creating auth user...")
    try:
        # Create user with service role (bypasses email confirmation)
        user_data = service_client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        user_id = user_data.user.id
        print(f"✅ Auth user created with ID: {user_id}")
    except Exception as e:
        print(f"⚠️  Auth user might already exist: {e}")
        # Try to get existing user
        try:
            # Login to get the user ID
            auth_response = client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            user_id = auth_response.user.id
            print(f"✅ Using existing auth user: {user_id}")
        except Exception as e2:
            print(f"❌ Failed to create/find auth user: {e2}")
            return None
    
    # Step 2: Create user in database table
    print("\n📝 Step 2: Creating user in database...")
    try:
        service_client.table("users").insert({
            "id": user_id,
            "email": email,
            "phone": "9999999999",
            "name": "Test User",
            "balance": 5000.00
        }).execute()
        print(f"✅ Database user created with balance: ₹5000")
    except Exception as e:
        print(f"⚠️  Database user might already exist: {e}")
    
    # Step 3: Get JWT token
    print("\n📝 Step 3: Getting JWT token...")
    try:
        auth_response = client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        token = auth_response.session.access_token
        
        print("\n" + "="*60)
        print("✅ SETUP COMPLETE!")
        print("="*60)
        print("\n📋 Your JWT Token (copy this):\n")
        print(token)
        print("\n" + "="*60)
        print("\n📌 How to use in Swagger:")
        print("1. Go to http://localhost:8000/docs")
        print("2. Click 'Authorize' button")
        print("3. Paste the token above in 'Value' field")
        print("4. Click 'Authorize'")
        print("5. Try GET /account/balance")
        print("="*60 + "\n")
        
        print("👤 Test User Details:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Balance: ₹5000")
        print(f"   Phone: 9999999999")
        print("="*60 + "\n")
        
        return token
        
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return None

if __name__ == "__main__":
    setup_test_user()

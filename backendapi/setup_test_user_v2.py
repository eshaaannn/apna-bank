from supabase import create_client
from config import settings
import uuid

def setup_test_user():
    """Create test user and get JWT token (Robust Version)."""
    
    client = create_client(settings.supabase_url, settings.supabase_key)
    service_client = create_client(settings.supabase_url, settings.supabase_service_key)
    
    email = "test@example.com"
    password = "password123"
    
    print("\n" + "="*60)
    print("🔧 Setting up test user (V2)")
    print("="*60)
    
    user_id = None
    
    # Step 1: Handle Auth User
    print("\n📝 Step 1: Handling Auth User...")
    try:
        # Try to find user first by listing (inefficient but safe for single user check)
        # Note: admin.list_users() returns a list of User objects
        users = service_client.auth.admin.list_users()
        existing_user = next((u for u in users if u.email == email), None)
        
        if existing_user:
            print(f"✅ Found existing user: {existing_user.id}")
            user_id = existing_user.id
            # Update password to ensure we can login
            service_client.auth.admin.update_user_by_id(user_id, {"password": password})
            print("✅ Password updated to 'password123'")
        else:
            # Create new user
            print("Creating new user...")
            user_data = service_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            user_id = user_data.user.id
            print(f"✅ Auth user created with ID: {user_id}")
            
    except Exception as e:
        print(f"❌ Auth error: {e}")
        return

    # Step 2: Ensure Database Record
    print("\n📝 Step 2: Upserting user in database...")
    try:
        # Upsert user (insert or update)
        service_client.table("users").upsert({
            "id": user_id,
            "email": email,
            "phone": "9999999999",
            "name": "Test User",
            "balance": 5000.00
        }).execute()
        print(f"✅ Database user synced (Balance: 5000)")
    except Exception as e:
        print(f"❌ Database error: {e}")
        # Continue anyway, maybe it exists

    # Step 3: Get Token
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
        print("\n📋 Your JWT Token:\n")
        print(token)
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Login failed: {e}")

if __name__ == "__main__":
    setup_test_user()

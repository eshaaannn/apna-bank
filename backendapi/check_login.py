from supabase import create_client
from config import settings

def test_login():
    print(f"Connecting to: {settings.supabase_url}")
    client = create_client(settings.supabase_url, settings.supabase_key)
    
    email = "test@example.com"
    password = "password123"
    
    print(f"Attempting login for: {email}")
    try:
        response = client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        print("✅ Login SUCCESSFUL!")
        print(f"User ID: {response.user.id}")
    except Exception as e:
        print(f"❌ Login FAILED: {e}")

if __name__ == "__main__":
    test_login()

from supabase import create_client
from config import settings
import sys

def check_service_key():
    print(f"Checking Service Key...")
    try:
        service_client = create_client(settings.supabase_url, settings.supabase_service_key)
        # Try a service-only operation, like listing users
        # Note: list_users might not be directly available on the client wrapper in all versions, 
        # but let's try accessing auth.admin
        
        print("Attempting to list users via auth.admin...")
        users = service_client.auth.admin.list_users()
        print("Service Key works!")
        print(f"Found {len(users)} users.")
        for user in users:
            print(f" - {user.email} (ID: {user.id})")
            
    except Exception as e:
        print(f"Service Key Check FAILED: {e}")
        # Print first few chars of key for debugging (safe-ish locally)
        key_start = settings.supabase_service_key[:10] if settings.supabase_service_key else "None"
        print(f"Key starts with: {key_start}...")

if __name__ == "__main__":
    check_service_key()

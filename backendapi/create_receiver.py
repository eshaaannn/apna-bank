from supabase import create_client
from config import settings
import uuid

def create_second_user():
    service_client = create_client(settings.supabase_url, settings.supabase_service_key)
    
    email = "receiver@example.com"
    password = "password123"
    
    print("\nCreating Receiver User...")
    try:
        # Create Auth User
        user_data = service_client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        user_id = user_data.user.id
        print(f"✅ Auth user created: {user_id}")
        
        # Create DB User
        service_client.table("users").upsert({
            "id": user_id,
            "email": email,
            "phone": "8888888888",
            "name": "Receiver Sharma",
            "balance": 100.00
        }).execute()
        print(f"✅ Database user created (Phone: 8888888888)")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_second_user()

"""
Sync authenticated user to database users table.
Run this after creating a new user in Supabase Auth.
"""

from supabase import create_client
from config import settings

def sync_auth_user_to_database(email: str, phone: str = "9999999999", name: str = None, initial_balance: float = 5000.0):
    """Add authenticated user to database users table."""
    
    service_client = create_client(settings.supabase_url, settings.supabase_service_key)
    
    print(f"\n🔄 Syncing user: {email}")
    print("="*60)
    
    # Step 1: Get user from Auth
    try:
        users = service_client.auth.admin.list_users()
        auth_user = next((u for u in users if u.email == email), None)
        
        if not auth_user:
            print(f"❌ User {email} not found in Supabase Auth")
            print("Create the user first in Authentication → Users")
            return False
        
        user_id = auth_user.id
        print(f"✅ Found auth user with ID: {user_id}")
        
    except Exception as e:
        print(f"❌ Error fetching auth user: {e}")
        return False
    
    # Step 2: Check if already in database
    try:
        existing = service_client.table("users").select("*").eq("id", user_id).execute()
        if existing.data:
            print(f"ℹ️  User already exists in database table")
            print(f"   Balance: ₹{existing.data[0]['balance']}")
            return True
    except Exception as e:
        pass
    
    # Step 3: Insert into database
    try:
        if not name:
            name = email.split('@')[0].replace('.', ' ').title()
        
        service_client.table("users").insert({
            "id": user_id,
            "email": email,
            "phone": phone,
            "name": name,
            "balance": initial_balance
        }).execute()
        
        print(f"✅ Added to database:")
        print(f"   Name: {name}")
        print(f"   Phone: {phone}")
        print(f"   Initial Balance: ₹{initial_balance}")
        print("="*60)
        print("✅ Sync complete! User can now use the API.")
        return True
        
    except Exception as e:
        print(f"❌ Error adding to database: {e}")
        return False

if __name__ == "__main__":
    print("\n🔧 Sync Supabase Auth User to Database")
    print("="*60)
    
    email = input("\nEnter user email: ").strip()
    phone = input("Enter phone (10 digits, default: 9999999999): ").strip() or "9999999999"
    name = input("Enter name (optional): ").strip() or None
    balance = input("Enter initial balance (default: 5000): ").strip() or "5000"
    
    try:
        balance = float(balance)
    except:
        balance = 5000.0
    
    sync_auth_user_to_database(email, phone, name, balance)

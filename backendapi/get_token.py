"""
Quick script to get JWT token for testing.
Run this to get a token for Swagger UI.
"""

import requests
import json
from config import settings

def get_jwt_token(email: str, password: str):
    """Login and get JWT token."""
    
    url = f"{settings.supabase_url}/auth/v1/token?grant_type=password"
    
    headers = {
        "apikey": settings.supabase_key,
        "Content-Type": "application/json"
    }
    
    data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        token = result.get("access_token")
        
        print("\n" + "="*60)
        print("✅ LOGIN SUCCESSFUL!")
        print("="*60)
        print("\n📋 Your JWT Token (copy this):\n")
        print(token)
        print("\n" + "="*60)
        print("\n📌 How to use in Swagger:")
        print("1. Click 'Authorize' button in Swagger UI")
        print("2. Paste the token above in the 'Value' field")
        print("3. Click 'Authorize'")
        print("4. Now you can test all protected endpoints!")
        print("="*60 + "\n")
        
        return token
        
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ Login failed: {e}")
        print(f"Response: {e.response.text}")
        return None
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None


if __name__ == "__main__":
    print("\n🔐 Supabase Login - Get JWT Token")
    print("="*60)
    
    # Change these to your test user credentials
    email = input("\nEnter email (default: test@example.com): ").strip() or "test@example.com"
    password = input("Enter password (default: password123): ").strip() or "password123"
    
    get_jwt_token(email, password)

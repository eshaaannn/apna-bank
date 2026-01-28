from supabase import create_client
from config import settings

def get_token():
    client = create_client(settings.supabase_url, settings.supabase_key)
    try:
        auth = client.auth.sign_in_with_password({
            "email": "test@example.com", 
            "password": "password123"
        })
        token = auth.session.access_token
        with open("token.txt", "w") as f:
            f.write(token)
        print("Token written to token.txt")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    get_token()

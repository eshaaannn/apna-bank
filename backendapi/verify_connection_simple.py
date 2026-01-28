from database import db
try:
    print("Attempting to fetch users...")
    users = db.client.table("users").select("*", count="exact").limit(1).execute()
    print("Connection successful!")
    print(f"Data: {users.data}")
except Exception as e:
    print(f"Connection failed: {e}")

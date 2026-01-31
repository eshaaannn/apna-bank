from database import db
from sqlalchemy import text

try:
    with db.engine.connect() as conn:
        result = conn.execute(text("SELECT id, email, name FROM users")).all()
        print(f"Found {len(result)} users:")
        for row in result:
            print(f"ID: {row[0]}, Email: {row[1]}, Name: {row[2]}")
except Exception as e:
    print(f"Error: {e}")

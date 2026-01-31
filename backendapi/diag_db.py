import sqlalchemy
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# We know these from previous steps
PROJECT_REF = "xbbnniiibvaqgrbxskzo"
PASSWORD = "Mansvi@12" # Plaintext for URL encoding test
import urllib.parse
ENCODED_PASSWORD = urllib.parse.quote_plus(PASSWORD)
IPS = ["3.111.105.85", "3.108.251.216"] # Pooler IPs

test_urls = [
    # SNI based pooler (often works with standard postgres user)
    f"postgresql://postgres:{ENCODED_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
    # Pooler with project ref in user, port 6543
    f"postgresql://postgres.{PROJECT_REF}:{ENCODED_PASSWORD}@{IPS[1]}:6543/postgres",
]

for url in test_urls:
    print(f"\nTesting URL: {url.replace(PASSWORD, '****').replace(ENCODED_PASSWORD, '****')}")
    try:
        engine = create_engine(url, connect_args={'connect_timeout': 5})
        with engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM users LIMIT 1")).fetchone()
            print(f"✅ SUCCESS! Found user: {result[0] if result else 'No users'}")
            print(f"USE THIS URL: {url}")
            break
    except Exception as e:
        print(f"❌ FAILED: {str(e)[:100]}")

print("\nDone.")

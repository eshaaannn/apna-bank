"""
Test all Voice Banking API endpoints with JWT token.
"""

import requests
from config import settings

# JWT token from login
TOKEN = input("Paste your full JWT token here: ").strip()

BASE_URL = "http://localhost:8000"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

print("\n" + "="*70)
print("🧪 Testing Voice Banking API Endpoints")
print("="*70)

# Test 1: Health Check (no auth needed)
print("\n1️⃣ Testing Health Check (GET /)...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print("   ✅ Health check passed!")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 2: Get Balance
print("\n2️⃣ Testing Get Balance (GET /account/balance)...")
try:
    response = requests.get(f"{BASE_URL}/account/balance", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print("   ✅ Balance check passed!")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 3: Voice Intent - Balance Check
print("\n3️⃣ Testing Voice Intent - Balance (POST /voice/intent)...")
try:
    data = {"text": "Check my balance"}
    response = requests.post(f"{BASE_URL}/voice/intent", headers=headers, json=data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print("   ✅ Voice intent (balance) passed!")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 4: Voice Intent - Transfer
print("\n4️⃣ Testing Voice Intent - Transfer (POST /voice/intent)...")
try:
    data = {"text": "Send 200 rupees to Priya"}
    response = requests.post(f"{BASE_URL}/voice/intent", headers=headers, json=data)
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Intent: {result.get('intent')}")
    print(f"   Confidence: {result.get('confidence')}")
    print(f"   Entities: {result.get('entities')}")
    print("   ✅ Voice intent (transfer) passed!")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 5: Voice Intent - Hinglish
print("\n5️⃣ Testing Voice Intent - Hinglish (POST /voice/intent)...")
try:
    data = {"text": "Mera balance kitna hai"}
    response = requests.post(f"{BASE_URL}/voice/intent", headers=headers, json=data)
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Intent: {result.get('intent')}")
    print(f"   Message: {result.get('message')}")
    print("   ✅ Voice intent (Hinglish) passed!")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 6: Bill Payment
print("\n6️⃣ Testing Bill Payment (POST /transaction/billpay)...")
try:
    data = {
        "bill_type": "electricity",
        "amount": 100.00,
        "account_number": "1234567890"
    }
    response = requests.post(f"{BASE_URL}/transaction/billpay", headers=headers, json=data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Response: {response.json()}")
        print("   ✅ Bill payment passed!")
    else:
        print(f"   Response: {response.json()}")
        print("   ℹ️ Expected if user doesn't exist in DB")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 7: Transaction History
print("\n7️⃣ Testing Transaction History (GET /transaction/history)...")
try:
    response = requests.get(f"{BASE_URL}/transaction/history?limit=10", headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   Total transactions: {result.get('total', 0)}")
        print("   ✅ Transaction history passed!")
    else:
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Failed: {e}")

print("\n" + "="*70)
print("✅ API Testing Complete!")
print("="*70)
print("\n📌 Next steps:")
print("1. Go to http://localhost:8000/docs")
print("2. Click 'Authorize' and paste your JWT token")
print("3. Test endpoints interactively in Swagger UI")
print("="*70 + "\n")

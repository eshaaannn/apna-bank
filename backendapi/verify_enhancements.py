import requests
import json

BASE_URL = "http://127.0.0.1:8000"
# Using the bypass user ID from auth.py
TEST_USER_ID = "e16aa1c7-bdc9-46cb-a15a-d9f6e8eb58ae"

def test_balance():
    print("\n--- Testing Get Balance ---")
    response = requests.get(f"{BASE_URL}/account/balance")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert "balance" in response.json()

def test_pin_setup():
    print("\n--- Testing PIN Setup ---")
    # Set login PIN (6 digits)
    res = requests.post(f"{BASE_URL}/account/setup-pin", json={"pin": "123456", "type": "login"})
    print(f"Login PIN Setup Status: {res.status_code}")
    
    # Set transfer PIN (4 digits)
    res = requests.post(f"{BASE_URL}/account/setup-pin", json={"pin": "1234", "type": "transfer"})
    print(f"Transfer PIN Setup Status: {res.status_code}")
    assert res.status_code == 200

def test_transfer_fraud_limit():
    print("\n--- Testing Transfer Fraud Limit (₹2000) ---")
    # Try ₹5000 (should fail)
    data = {
        "receiver_phone": "9999999999", # Doesn't matter if receiver exists for fraud check if it's done early
        "amount": 5000.0,
        "transfer_pin": "1234"
    }
    response = requests.post(f"{BASE_URL}/transaction/transfer", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 400
    assert "exceeds limit" in response.json()["detail"]

def test_confirmation_required():
    print("\n--- Testing Confirmation Required (Transfer) ---")
    data = {
        "receiver_phone": "9999999999",
        "amount": 100.0
    }
    response = requests.post(f"{BASE_URL}/transaction/transfer", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert response.json()["status"] == "confirmation_required"
    assert "Please say or enter your 4-digit transfer PIN" in response.json()["message"]

if __name__ == "__main__":
    try:
        test_balance()
        test_pin_setup()
        test_transfer_fraud_limit()
        test_confirmation_required()
        print("\n✅ All basic tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")

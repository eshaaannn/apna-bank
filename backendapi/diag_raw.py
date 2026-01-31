import requests

BASE_URL = "http://localhost:8000"

def test_raw(text):
    print(f"\n--- Testing: '{text}' ---")
    response = requests.post(f"{BASE_URL}/voice/intent", json={"text": text})
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")

if __name__ == "__main__":
    test_raw("Check my balance")
    test_raw("Send 500 to 8888888888")

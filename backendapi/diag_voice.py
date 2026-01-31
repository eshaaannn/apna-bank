import requests
import json

BASE_URL = "http://localhost:8000"

def test_voice_intent(text):
    print(f"\nTesting: '{text}'")
    try:
        # Using the bypass mode (no Authorization header)
        response = requests.post(
            f"{BASE_URL}/voice/intent",
            json={"text": text}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response JSON:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_voice_intent("Check my balance")
    test_voice_intent("Send 500 rupees to 8888888888")

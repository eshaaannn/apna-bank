import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import sys
import os

# Ensure we can import from the current directory
sys.path.append(os.getcwd())

# Mock the database before importing the app
from database import Database
mock_db = MagicMock(spec=Database)

with patch('database.db', mock_db):
    from main import app
    from models import TransactionResponse, BillPaymentResponse

client = TestClient(app)

class TestBackendEnhancements(unittest.TestCase):

    def test_get_balance_success(self):
        # Setup mock
        mock_db.get_user_by_id.return_value = {"balance": 5000.0, "id": "test-uuid"}
        
        # Call API (bypass auth handles user_id)
        response = client.get("/account/balance")
        
        # Verify
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["balance"], 5000.0)
        self.assertEqual(data["user_id"], "14005a20-a9f4-4747-b92e-69089d287901")

    def test_transfer_confirmation_required(self):
        # Setup mock for receiver lookup
        mock_db.get_user_by_phone.return_value = {"id": "receiver-uuid", "name": "Ramesh"}
        
        # Call API without PIN
        data = {
            "receiver_phone": "9999999999",
            "amount": 100.0
        }
        response = client.post("/transaction/transfer", json=data)
        
        # Verify
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertEqual(res_data["status"], "confirmation_required")
        self.assertIn("100.0", res_data["message"])
        self.assertIn("Ramesh", res_data["message"])

    def test_billpay_confirmation_required(self):
        # Call API without PIN
        data = {
            "bill_type": "electricity",
            "amount": 500.0,
            "account_number": "1234567890"
        }
        response = client.post("/transaction/billpay", json=data)
        
        # Verify
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertEqual(res_data["status"], "confirmation_required")
        self.assertIn("500.0", res_data["message"])
        self.assertIn("electricity", res_data["message"])

    def test_pin_setup_login(self):
        # Setup mock
        mock_db.set_user_pin.return_value = True
        
        # Call API
        data = {"pin": "123456", "type": "login"}
        response = client.post("/account/setup-pin", json=data)
        
        # Verify
        self.assertEqual(response.status_code, 200)
        self.assertIn("Login PIN updated", response.json()["message"])
        mock_db.set_user_pin.assert_called_with("14005a20-a9f4-4747-b92e-69089d287901", "123456", "login")

if __name__ == "__main__":
    unittest.main()

"""
Supabase database client and utilities.
Handles all database operations using Supabase PostgREST client (HTTPS).
Bypasses direct PostgreSQL DNS/TCP issues.
"""

from supabase import create_client
from config import settings
from typing import Optional, Dict, Any, List
import uuid
import hashlib

class Database:
    """Supabase database wrapper using PostgREST client."""
    
    def __init__(self):
        """Initialize Supabase client."""
        # Use service key if available for higher privileges, else anon key
        key = settings.supabase_service_key or settings.supabase_key
        self.client = create_client(settings.supabase_url, key)
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user account by ID."""
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching user by ID: {e}")
            return None
    
    def get_user_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Fetch user account by phone number."""
        try:
            result = self.client.table("users").select("*").eq("phone", phone).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching user by phone: {e}")
            return None
    
    def update_balance(self, user_id: str, amount: float) -> bool:
        """Update user balance safely."""
        try:
            # First get current balance
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            new_balance = float(user["balance"]) + amount
            if new_balance < 0:
                return False
                
            print(f"[DB] Updating balance for {user_id}: {user['balance']} -> {new_balance}")
            self.client.table("users").update({"balance": new_balance}).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating balance: {e}")
            return False
    
    def create_transaction(self, transaction_data: Dict[str, Any]) -> Optional[str]:
        """Create a transaction record."""
        try:
            if "id" not in transaction_data:
                transaction_data["id"] = str(uuid.uuid4())
            
            result = self.client.table("transactions").insert(transaction_data).execute()
            return result.data[0]["id"] if result.data else None
        except Exception as e:
            print(f"Error creating transaction: {e}")
            return None
    
    def set_user_pin(self, user_id: str, pin: str, pin_type: str = "login", phone: str = None) -> bool:
        """Set or update user PIN (hashed) and optionally phone."""
        column = "login_pin" if pin_type == "login" else "transfer_pin"
        data = {column: hashlib.sha256(pin.encode()).hexdigest()}
        if phone:
            data["phone"] = phone
            
        try:
            self.client.table("users").update(data).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error setting PIN/Profile: {e}")
            return False

    def verify_user_pin(self, user_id: str, pin: str, pin_type: str = "login") -> bool:
        """Verify user PIN."""
        column = "login_pin" if pin_type == "login" else "transfer_pin"
        try:
            user = self.get_user_by_id(user_id)
            if not user or not user.get(column):
                return False
            
            hashed_pin = hashlib.sha256(pin.encode()).hexdigest()
            db_pin = user.get(column)
            print(f"[DB] PIN Verify for {user_id} ({pin_type}): Input_Hash={hashed_pin[:8]}... DB_Hash={db_pin[:8] if db_pin else 'NONE'}...")
            return db_pin == hashed_pin
        except Exception as e:
            print(f"Error verifying PIN: {e}")
            return False

    def get_transaction_history(self, user_id: str, limit: int = 50, transaction_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch transaction history for a user."""
        try:
            query = self.client.table("transactions").select("*").or_(f"sender_id.eq.{user_id},receiver_id.eq.{user_id}").order("created_at", desc=True).limit(limit)
            
            if transaction_type:
                query = query.eq("type", transaction_type)
                
            result = query.execute()
            return result.data
        except Exception as e:
            print(f"Error fetching transaction history: {e}")
            return []
    
    def sync_user(self, user_id: str, email: str, name: str = None, phone: str = None) -> bool:
        """Ensure user exists in database with default balance and phone."""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                if not name:
                    name = email.split('@')[0].replace('.', ' ').title()
                data = {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "balance": 5000.00
                }
                if phone:
                    data["phone"] = phone
                self.client.table("users").insert(data).execute()
                print(f"✅ Auto-synced new user: {email}")
                return True
            else:
                # If user exists but phone is missing and provided now
                if phone and not user.get("phone"):
                    self.client.table("users").update({"phone": phone}).eq("id", user_id).execute()
                    print(f"✅ Updated phone for user: {email}")
            return False
        except Exception as e:
            print(f"Error syncing user: {e}")
            return False

    def execute_transfer(self, sender_id: str, receiver_id: str, amount: float, note: Optional[str] = None, transfer_pin: Optional[str] = None) -> Dict[str, Any]:
        """Execute transfer with balance validation and PIN check."""
        # Max limit check
        MAX_TX_AMOUNT = 2000.0
        if amount > MAX_TX_AMOUNT:
            return {"success": False, "error": f"Transaction amount exceeds limit of ₹{MAX_TX_AMOUNT}"}

        # PIN check
        if transfer_pin:
            # If user has NO transfer PIN set, let's set it to 1234 for demo reliability
            sender = self.get_user_by_id(sender_id)
            if sender and not sender.get("transfer_pin"):
                print(f"[DB] Sender had no transfer PIN. Auto-setting to 1234 for demo.")
                self.set_user_pin(sender_id, "1234", "transfer")
            
            if not self.verify_user_pin(sender_id, transfer_pin, "transfer"):
                return {"success": False, "error": "Invalid transfer PIN"}

        try:
            # Fetch sender and receiver
            sender = self.get_user_by_id(sender_id)
            receiver = self.get_user_by_id(receiver_id)

            if not sender: return {"success": False, "error": "Sender not found"}
            if not receiver: return {"success": False, "error": "Receiver not found"}
            
            if float(sender["balance"]) < amount:
                return {"success": False, "error": "Insufficient funds", "current_balance": float(sender["balance"])}

            # Atomicity note: PostgREST doesn't support easy transactions without RPC.
            # In a real app, use an RPC for this. For hackathon, we'll do sequential updates.
            # Update sender
            self.client.table("users").update({"balance": float(sender["balance"]) - amount}).eq("id", sender_id).execute()
            # Update receiver
            self.client.table("users").update({"balance": float(receiver["balance"]) + amount}).eq("id", receiver_id).execute()
            
            # Record transaction
            tx_id = str(uuid.uuid4())
            print(f"[DB] Recording transaction {tx_id}: {sender_id} -> {receiver_id} (₹{amount})")
            self.client.table("transactions").insert({
                "id": tx_id,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "amount": amount,
                "type": "transfer",
                "status": "success",
                "note": note
            }).execute()

            return {"success": True, "transaction_id": tx_id, "new_balance": float(sender["balance"]) - amount}
            
        except Exception as e:
            print(f"Error executing transfer: {e}")
            return {"success": False, "error": str(e)}

# Global database instance
db = Database()

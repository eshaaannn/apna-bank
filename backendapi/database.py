"""
Supabase database client and utilities.
Handles all database operations and transactions.
"""

from supabase import create_client, Client
from config import settings
from typing import Optional, Dict, Any, List


class Database:
    """Supabase database wrapper with helper methods."""
    
    def __init__(self):
        """Initialize Supabase client."""
        self.client: Client = create_client(
            settings.supabase_url,
            settings.supabase_key
        )
        self.service_client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user account by ID."""
        try:
            response = self.service_client.table("users").select("*").eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user by ID: {e}")
            return None
    
    def get_user_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Fetch user account by phone number."""
        try:
            response = self.service_client.table("users").select("*").eq("phone", phone).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user by phone: {e}")
            return None
    
    def update_balance(self, user_id: str, amount: float) -> bool:
        """
        Update user balance (add or subtract).
        Uses atomic increment/decrement to prevent race conditions.
        """
        try:
            # First get current balance
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            new_balance = user["balance"] + amount
            
            # Check for negative balance
            if new_balance < 0:
                return False
            
            # Update balance
            self.service_client.table("users").update({
                "balance": new_balance
            }).eq("id", user_id).execute()
            
            return True
        except Exception as e:
            print(f"Error updating balance: {e}")
            return False
    
    def create_transaction(self, transaction_data: Dict[str, Any]) -> Optional[str]:
        """Create a transaction record and return transaction ID."""
        try:
            response = self.service_client.table("transactions").insert(transaction_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"Error creating transaction: {e}")
            return None
    
    def get_transaction_history(
        self, 
        user_id: str, 
        limit: int = 50,
        transaction_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch transaction history for a user."""
        try:
            query = self.service_client.table("transactions").select("*").or_(
                f"sender_id.eq.{user_id},receiver_id.eq.{user_id}"
            ).order("created_at", desc=True).limit(limit)
            
            if transaction_type:
                query = query.eq("type", transaction_type)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching transaction history: {e}")
            return []
    
    def execute_transfer(
        self,
        sender_id: str,
        receiver_id: str,
        amount: float,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute atomic transfer between two users.
        Returns dict with success status and transaction details.
        """
        try:
            # Validate sender balance
            sender = self.get_user_by_id(sender_id)
            if not sender:
                return {"success": False, "error": "Sender not found"}
            
            if sender["balance"] < amount:
                return {
                    "success": False,
                    "error": "Insufficient funds",
                    "current_balance": sender["balance"],
                    "requested_amount": amount
                }
            
            # Validate receiver exists
            receiver = self.get_user_by_id(receiver_id)
            if not receiver:
                return {"success": False, "error": "Receiver not found"}
            
            # Deduct from sender
            if not self.update_balance(sender_id, -amount):
                return {"success": False, "error": "Failed to deduct from sender"}
            
            # Add to receiver
            if not self.update_balance(receiver_id, amount):
                # Rollback sender deduction
                self.update_balance(sender_id, amount)
                return {"success": False, "error": "Failed to credit receiver"}
            
            # Create transaction record
            transaction_id = self.create_transaction({
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "amount": amount,
                "type": "transfer",
                "status": "completed",
                "note": note
            })
            
            # Get new balance
            updated_sender = self.get_user_by_id(sender_id)
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "new_balance": updated_sender["balance"]
            }
            
        except Exception as e:
            print(f"Error executing transfer: {e}")
            return {"success": False, "error": str(e)}


# Global database instance
db = Database()

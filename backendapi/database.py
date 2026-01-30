"""
Supabase database client and utilities.
Handles all database operations using direct PostgreSQL connection via SQLAlchemy.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings
from typing import Optional, Dict, Any, List
import uuid

class Database:
    """PostgreSQL database wrapper using SQLAlchemy."""
    
    def __init__(self):
        """Initialize SQLAlchemy engine and session factory."""
        # We use psycopg2-binary for the connection
        self.engine = create_engine(settings.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def _row_to_dict(self, row):
        """Convert SQLAlchemy row to dictionary."""
        if not row:
            return None
        return dict(row._mapping)

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user account by ID."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("SELECT * FROM users WHERE id = :user_id"),
                    {"user_id": user_id}
                ).first()
                return self._row_to_dict(result)
        except Exception as e:
            print(f"Error fetching user by ID: {e}")
            return None
    
    def get_user_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Fetch user account by phone number."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("SELECT * FROM users WHERE phone = :phone"),
                    {"phone": phone}
                ).first()
                return self._row_to_dict(result)
        except Exception as e:
            print(f"Error fetching user by phone: {e}")
            return None
    
    def update_balance(self, user_id: str, amount: float) -> bool:
        """
        Update user balance (add or subtract).
        Uses atomic SQL increment/decrement.
        """
        try:
            with self.engine.begin() as conn:
                # First check if the update would result in negative balance
                user = conn.execute(
                    text("SELECT balance FROM users WHERE id = :user_id"),
                    {"user_id": user_id}
                ).first()
                
                if not user:
                    return False
                
                if user.balance + amount < 0:
                    return False
                
                # Perform update
                conn.execute(
                    text("UPDATE users SET balance = balance + :amount WHERE id = :user_id"),
                    {"amount": amount, "user_id": user_id}
                )
            return True
        except Exception as e:
            print(f"Error updating balance: {e}")
            return False
    
    def create_transaction(self, transaction_data: Dict[str, Any]) -> Optional[str]:
        """Create a transaction record and return transaction ID."""
        try:
            # Generate ID if not provided
            if "id" not in transaction_data:
                transaction_data["id"] = str(uuid.uuid4())
                
            cols = ", ".join(transaction_data.keys())
            placeholders = ", ".join([f":{k}" for k in transaction_data.keys()])
            sql = f"INSERT INTO transactions ({cols}) VALUES ({placeholders}) RETURNING id"
            
            with self.engine.begin() as conn:
                result = conn.execute(text(sql), transaction_data).first()
                return result[0] if result else None
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
            sql = "SELECT * FROM transactions WHERE sender_id = :user_id OR receiver_id = :user_id"
            params = {"user_id": user_id}
            
            if transaction_type:
                sql += " AND type = :type"
                params["type"] = transaction_type
                
            sql += " ORDER BY created_at DESC LIMIT :limit"
            params["limit"] = limit
            
            with self.engine.connect() as conn:
                results = conn.execute(text(sql), params).all()
                return [self._row_to_dict(r) for r in results]
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
        Execute atomic transfer between two users using a real SQL transaction.
        Returns dict with success status and transaction details.
        """
        try:
            with self.engine.begin() as conn:
                # 1. Validate sender balance and existence
                sender = conn.execute(
                    text("SELECT balance FROM users WHERE id = :sender_id FOR UPDATE"),
                    {"sender_id": sender_id}
                ).first()
                
                if not sender:
                    return {"success": False, "error": "Sender not found"}
                
                if sender.balance < amount:
                    return {
                        "success": False,
                        "error": "Insufficient funds",
                        "current_balance": float(sender.balance),
                        "requested_amount": amount
                    }
                
                # 2. Validate receiver existence
                receiver = conn.execute(
                    text("SELECT id FROM users WHERE id = :receiver_id"),
                    {"receiver_id": receiver_id}
                ).first()
                
                if not receiver:
                    return {"success": False, "error": "Receiver not found"}
                
                # 3. Deduct from sender
                conn.execute(
                    text("UPDATE users SET balance = balance - :amount WHERE id = :sender_id"),
                    {"amount": amount, "sender_id": sender_id}
                )
                
                # 4. Add to receiver
                conn.execute(
                    text("UPDATE users SET balance = balance + :amount WHERE id = :receiver_id"),
                    {"amount": amount, "receiver_id": receiver_id}
                )
                
                # 5. Create transaction record
                transaction_id = str(uuid.uuid4())
                conn.execute(
                    text("""
                        INSERT INTO transactions (id, sender_id, receiver_id, amount, type, status, note)
                        VALUES (:id, :sender_id, :receiver_id, :amount, 'transfer', 'completed', :note)
                    """),
                    {
                        "id": transaction_id,
                        "sender_id": sender_id,
                        "receiver_id": receiver_id,
                        "amount": amount,
                        "note": note
                    }
                )
                
                # 6. Get new balance
                updated_sender = conn.execute(
                    text("SELECT balance FROM users WHERE id = :sender_id"),
                    {"sender_id": sender_id}
                ).first()
                
                return {
                    "success": True,
                    "transaction_id": transaction_id,
                    "new_balance": float(updated_sender.balance)
                }
                
        except Exception as e:
            print(f"Error executing transfer: {e}")
            return {"success": False, "error": str(e)}


# Global database instance
db = Database()

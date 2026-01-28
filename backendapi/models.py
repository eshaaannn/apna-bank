"""
Pydantic models for request and response validation.
Defines the structure of API inputs and outputs.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


# ============== Request Models ==============

class TransferRequest(BaseModel):
    """Request model for money transfer."""
    receiver_phone: str = Field(..., description="Receiver's phone number")
    amount: float = Field(..., gt=0, description="Amount to transfer (must be > 0)")
    note: Optional[str] = Field(None, description="Optional note for transaction")


class BillPaymentRequest(BaseModel):
    """Request model for bill payment."""
    bill_type: str = Field(..., description="Type of bill (electricity, water, mobile, etc.)")
    amount: float = Field(..., gt=0, description="Amount to pay")
    account_number: str = Field(..., description="Bill account number")


class VoiceIntentRequest(BaseModel):
    """Request model for voice intent processing."""
    text: str = Field(..., description="Transcribed voice text", min_length=1)


# ============== Response Models ==============

class BalanceResponse(BaseModel):
    """Response model for balance check."""
    balance: float
    currency: str = "INR"
    user_id: str


class TransactionResponse(BaseModel):
    """Response model for successful transaction."""
    transaction_id: str
    status: str
    new_balance: float
    message: Optional[str] = None


class BillPaymentResponse(BaseModel):
    """Response model for bill payment."""
    transaction_id: str
    status: str
    bill_type: str
    new_balance: float


class VoiceIntentResponse(BaseModel):
    """Response model for voice intent parsing."""
    intent: str
    confidence: float
    entities: Dict[str, Any]
    action_required: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class TransactionHistoryItem(BaseModel):
    """Single transaction in history."""
    id: str
    type: str
    amount: float
    status: str
    created_at: str
    sender_id: Optional[str] = None
    receiver_id: Optional[str] = None
    note: Optional[str] = None


class TransactionHistoryResponse(BaseModel):
    """Response model for transaction history."""
    transactions: List[TransactionHistoryItem]
    total: int


class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

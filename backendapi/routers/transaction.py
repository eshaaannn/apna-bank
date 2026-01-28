"""
Transaction-related API endpoints.
Handles money transfers, bill payments, and transaction history.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_user_id
from database import db
from models import (
    TransferRequest,
    BillPaymentRequest,
    TransactionResponse,
    BillPaymentResponse,
    TransactionHistoryResponse,
    TransactionHistoryItem,
    ErrorResponse
)
from typing import Optional


router = APIRouter(prefix="/transaction", tags=["Transactions"])


@router.post(
    "/transfer",
    response_model=TransactionResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad request (insufficient funds, invalid receiver, etc.)"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Receiver not found"}
    },
    summary="Transfer Money",
    description="Transfer money from authenticated user to another user by phone number."
)
async def transfer_money(
    request: TransferRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Transfer money to another user.
    
    **Security**: Requires valid JWT. Validates:
    - Amount > 0 (enforced by Pydantic)
    - Sufficient balance
    - Receiver exists
    
    **Atomicity**: Uses database transactions to prevent double-spending.
    """
    # Validate amount
    if request.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Find receiver by phone
    receiver = db.get_user_by_phone(request.receiver_phone)
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No user found with phone number {request.receiver_phone}"
        )
    
    # Prevent self-transfer
    if receiver["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer money to yourself"
        )
    
    # Execute transfer
    result = db.execute_transfer(
        sender_id=user_id,
        receiver_id=receiver["id"],
        amount=request.amount,
        note=request.note
    )
    
    if not result["success"]:
        # Handle specific errors
        if "Insufficient funds" in result.get("error", ""):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"],
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Transfer failed")
            )
    
    return TransactionResponse(
        transaction_id=result["transaction_id"],
        status="success",
        new_balance=result["new_balance"],
        message=f"Successfully transferred ₹{request.amount} to {receiver.get('name', request.receiver_phone)}"
    )


@router.post(
    "/billpay",
    response_model=BillPaymentResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad request (insufficient funds, invalid bill type, etc.)"},
        401: {"model": ErrorResponse, "description": "Unauthorized"}
    },
    summary="Pay Bill",
    description="Pay utility bills (electricity, water, mobile, etc.)."
)
async def pay_bill(
    request: BillPaymentRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Pay a utility bill.
    
    **Security**: Requires valid JWT. Validates:
    - Amount > 0
    - Sufficient balance
    - Valid bill type
    
    **Note**: For hackathon MVP, this deducts from user balance without real integration.
    """
    # Validate amount
    if request.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Validate bill type
    valid_bill_types = ["electricity", "water", "mobile", "internet", "gas"]
    if request.bill_type not in valid_bill_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid bill type. Must be one of: {', '.join(valid_bill_types)}"
        )
    
    # Get user balance
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check sufficient balance
    if user["balance"] < request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds. Current balance: ₹{user['balance']}, Required: ₹{request.amount}"
        )
    
    # Deduct amount
    if not db.update_balance(user_id, -request.amount):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process bill payment"
        )
    
    # Create transaction record
    transaction_id = db.create_transaction({
        "sender_id": user_id,
        "receiver_id": None,  # Bill payment has no receiver
        "amount": request.amount,
        "type": "billpay",
        "status": "completed",
        "note": f"{request.bill_type} bill payment - Account: {request.account_number}"
    })
    
    # Get updated balance
    updated_user = db.get_user_by_id(user_id)
    
    return BillPaymentResponse(
        transaction_id=transaction_id,
        status="success",
        bill_type=request.bill_type,
        new_balance=updated_user["balance"]
    )


@router.get(
    "/history",
    response_model=TransactionHistoryResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"}
    },
    summary="Get Transaction History",
    description="Fetch transaction history for the authenticated user with optional filtering."
)
async def get_transaction_history(
    limit: int = 50,
    transaction_type: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get transaction history.
    
    **Query Parameters**:
    - limit: Max number of transactions to return (default: 50)
    - transaction_type: Filter by type (transfer, billpay)
    
    **Security**: Requires valid JWT. Only returns transactions for authenticated user.
    """
    # Fetch transactions
    transactions = db.get_transaction_history(
        user_id=user_id,
        limit=min(limit, 100),  # Cap at 100
        transaction_type=transaction_type
    )
    
    # Convert to response models
    transaction_items = [
        TransactionHistoryItem(
            id=t["id"],
            type=t["type"],
            amount=t["amount"],
            status=t["status"],
            created_at=t["created_at"],
            sender_id=t.get("sender_id"),
            receiver_id=t.get("receiver_id"),
            note=t.get("note")
        )
        for t in transactions
    ]
    
    return TransactionHistoryResponse(
        transactions=transaction_items,
        total=len(transaction_items)
    )

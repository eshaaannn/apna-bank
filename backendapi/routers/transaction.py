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
    print(f"\n[TRANSFER] Request from {user_id} for amount {request.amount} to {request.receiver_phone}")
    if request.transfer_pin:
        print(f"[TRANSFER] PIN provided: YES")
    else:
        print(f"[TRANSFER] PIN provided: NO")
    """
    Transfer money to another user.
    
    **Security**: 
    - Requires valid JWT.
    - Requires 4-digit Transfer PIN for final execution.
    - Enforces ₹2000 per-transaction limit.
    """
    # 1. Basic Validation
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    # 2. Check for PIN
    if not request.transfer_pin:
        # If no PIN, we return a "Confirmation Required" prompt
        # Resolve receiver name for a better message
        receiver = db.get_user_by_phone(request.receiver_phone)
        receiver_display = receiver.get("name", request.receiver_phone) if receiver else request.receiver_phone
        
        return TransactionResponse(
            transaction_id="pending",
            status="confirmation_required",
            new_balance=0.0,
            message=f"I will transfer ₹{request.amount} to {receiver_display}. Please say or enter your 4-digit transfer PIN to confirm."
        )

    # 3. Find receiver by phone
    receiver = db.get_user_by_phone(request.receiver_phone)
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No user found with phone number {request.receiver_phone}"
        )
    
    # 4. Prevent self-transfer
    if receiver["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot transfer money to yourself")
    
    # 5. Execute transfer (Includes Fraud Checks and PIN Verification)
    result = db.execute_transfer(
        sender_id=user_id,
        receiver_id=receiver["id"],
        amount=request.amount,
        note=request.note,
        transfer_pin=request.transfer_pin
    )
    
    if not result["success"]:
        # Specific business logic errors
        error_msg = result.get("error", "Transfer failed")
        print(f"[TRANSFER] Failed: {error_msg}")
        if "PIN" in error_msg:
            raise HTTPException(status_code=401, detail=error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    print(f"[TRANSFER] Success!")
    
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
    """
    # 1. Validation
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    valid_bill_types = ["electricity", "water", "mobile", "internet", "gas"]
    if request.bill_type not in valid_bill_types:
        raise HTTPException(status_code=400, detail=f"Invalid bill type. Use: {', '.join(valid_bill_types)}")

    # 2. Check for PIN
    if not request.transfer_pin:
        return BillPaymentResponse(
            transaction_id="pending",
            status="confirmation_required",
            bill_type=request.bill_type,
            new_balance=0.0,
            message=f"I will pay ₹{request.amount} for your {request.bill_type} bill. Please say or enter your 4-digit transfer PIN to confirm."
        )

    # 3. Verify PIN
    if not db.verify_user_pin(user_id, request.transfer_pin, "transfer"):
        raise HTTPException(status_code=401, detail="Invalid transfer PIN")

    # 4. Get user balance
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 5. FRAUD CHECK: Max Limit
    MAX_TX_AMOUNT = 2000.0
    if request.amount > MAX_TX_AMOUNT:
        raise HTTPException(status_code=400, detail=f"Bill payment exceeds limit of ₹{MAX_TX_AMOUNT}")

    # 6. Check sufficient balance
    if user["balance"] < request.amount:
        raise HTTPException(status_code=400, detail=f"Insufficient funds")
    
    # 7. Deduct amount and create record
    if not db.update_balance(user_id, -request.amount):
        raise HTTPException(status_code=500, detail="Failed to process payment")
    
    transaction_id = db.create_transaction({
        "sender_id": user_id,
        "receiver_id": None,
        "amount": request.amount,
        "type": "billpay",
        "status": "success",
        "note": f"{request.bill_type} bill payment - Account: {request.account_number}"
    })
    
    # 8. Return response
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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.wallet import WalletBalance, WalletTransaction
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import User, Transaction
from datetime import datetime

router = APIRouter()

@router.get("/balance", response_model=WalletBalance)
async def get_balance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Convert SQLAlchemy models to schema format
    transactions = []
    for t in current_user.transactions:
        transactions.append({
            "amount": t.amount,
            "type": t.type,
            "description": t.description,
            "timestamp": t.timestamp
        })
        
    return {
        "user_id": current_user.id,
        "balance": current_user.wallet_balance,
        "transactions": transactions
    }

@router.post("/add-funds")
async def add_funds(amount: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.wallet_balance += amount
    
    transaction = Transaction(
        user_id=current_user.id,
        amount=amount,
        type="credit",
        description="Added funds",
        timestamp=datetime.utcnow()
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Funds added", "new_balance": current_user.wallet_balance}

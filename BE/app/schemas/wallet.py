from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WalletTransaction(BaseModel):
    amount: float
    type: str # credit, debit
    description: str
    timestamp: datetime = datetime.now()

class WalletBalance(BaseModel):
    user_id: int
    balance: float
    currency: str = "INR"
    transactions: List[WalletTransaction] = []

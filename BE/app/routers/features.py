from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import News, User, Product, ProductOrder, Transaction, Astrologer
from app.schemas.news import NewsOut
from app.dependencies import get_current_user

router = APIRouter()

# --- Mock Data Models ---

class ShopItem(BaseModel):
    id: int
    name: str
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class PurchaseRequest(BaseModel):
    product_id: int
    quantity: int = 1

class HoroscopeData(BaseModel):
    sign: str
    prediction: str

class PanchangData(BaseModel):
    date: str
    tithi: str
    nakshatra: str
    yog: str
    karan: str

# --- Endpoints ---

@router.get("/panchang/daily", response_model=PanchangData)
def get_daily_panchang():
    return {
        "date": "Today",
        "tithi": "Shukla Paksha Dashami",
        "nakshatra": "Rohini",
        "yog": "Indra",
        "karan": "Taitila"
    }

@router.get("/horoscope/daily", response_model=List[HoroscopeData])
def get_daily_horoscope():
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    return [
        {"sign": sign, "prediction": f"Today is a great day for {sign}. Focus on your goals."}
        for sign in signs
    ]

@router.get("/shop/items", response_model=List[ShopItem])
def get_shop_items(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.created_at.desc())
        .limit(40)
        .all()
    )
    items: List[ShopItem] = []
    for p in products:
        items.append(
            ShopItem(
                id=p.id,
                name=p.name,
                price=p.price,
                image_url=p.image_url,
                category=p.category,
                description=p.description,
            )
        )
    return items


@router.post("/shop/purchase")
def purchase_product(
    payload: PurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id, Product.is_active == True)
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    quantity = payload.quantity if payload.quantity > 0 else 1
    total_amount = product.price * quantity

    if current_user.wallet_balance < total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance"
        )

    platform_fee_rate = 0.2
    platform_fee_amount = total_amount * platform_fee_rate
    astrologer_earning_amount = total_amount - platform_fee_amount

    current_user.wallet_balance -= total_amount

    now = datetime.utcnow()

    user_txn = Transaction(
        user_id=current_user.id,
        amount=total_amount,
        type="debit",
        description=f"Purchase of {product.name}",
        timestamp=now,
    )
    db.add(user_txn)

    astrologer_id = product.astrologer_id
    settlement_due_date = now + timedelta(days=5)

    order = ProductOrder(
        user_id=current_user.id,
        astrologer_id=astrologer_id,
        product_id=product.id,
        quantity=quantity,
        total_amount=total_amount,
        platform_fee_amount=platform_fee_amount,
        astrologer_earning_amount=astrologer_earning_amount if astrologer_id else 0.0,
        status="paid",
        created_at=now,
        settlement_due_date=settlement_due_date,
    )
    db.add(order)

    db.commit()
    db.refresh(order)
    db.refresh(current_user)

    return {
        "order_id": order.id,
        "status": order.status,
        "total_amount": total_amount,
        "platform_fee_amount": platform_fee_amount,
        "astrologer_earning_amount": order.astrologer_earning_amount,
        "new_balance": current_user.wallet_balance,
        "settlement_due_date": order.settlement_due_date,
    }

@router.get("/news", response_model=List[NewsOut])
def get_news(db: Session = Depends(get_db)):
    return db.query(News).order_by(News.created_at.desc()).limit(20).all()

@router.get("/reports/available")
def get_available_reports():
    return [
        {"id": "brihat_kundli", "title": "Brihat Kundli", "description": "Detailed life report"},
        {"id": "raj_yog", "title": "Raj Yog Report", "description": "Check for royal yoga in your chart"},
        {"id": "year_book", "title": "Year Book", "description": "Annual predictions"},
        {"id": "horoscope_2026", "title": "Horoscope 2026", "description": "Future insights for 2026"},
    ]

@router.get("/insights/{category}")
def get_insights(category: str):
    # Covers: career, mental-health, love, education, today
    descriptions = {
        "career": "Your career prospects are looking bright. Hard work will pay off.",
        "mental-health": "Take some time for meditation and mindfulness today.",
        "love": "Romance is in the air. Express your feelings.",
        "education": "Good time for learning new skills.",
        "today": "Today's energy supports new beginnings."
    }
    return {"category": category, "insight": descriptions.get(category, "General positive vibes for you.")}

@router.post("/matching/check")
def check_matching(boy_details: Dict[str, Any], girl_details: Dict[str, Any]):
    return {
        "score": 28,
        "total": 36,
        "status": "Good Match",
        "details": "Guna Milan shows high compatibility."
    }

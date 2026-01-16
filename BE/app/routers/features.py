from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import News
from app.schemas.news import NewsOut

router = APIRouter()

# --- Mock Data Models ---

class ShopItem(BaseModel):
    id: int
    name: str
    price: float
    image_url: str
    category: str

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
def get_shop_items():
    return [
        {"id": 1, "name": "Gemstone Ring", "price": 4999.00, "image_url": "https://via.placeholder.com/150", "category": "Gemstones"},
        {"id": 2, "name": "Rudraksha Mala", "price": 1200.00, "image_url": "https://via.placeholder.com/150", "category": "Spiritual"},
        {"id": 3, "name": "Yantra", "price": 500.00, "image_url": "https://via.placeholder.com/150", "category": "Yantra"},
        {"id": 4, "name": "Crystal Ball", "price": 2500.00, "image_url": "https://via.placeholder.com/150", "category": "Crystals"},
    ]

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

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import News
from app.schemas.news import NewsOut
from app.services.openai_service import openai_service
from app.services.ai_guru_service import ai_guru_service
from datetime import datetime

router = APIRouter()

# --- Mock Data Models ---

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class ShopItem(BaseModel):
    id: int
    name: str
    price: float
    image_url: str
    category: str

class ServiceItem(BaseModel):
    id: int
    title: str
    description: str
    icon_name: str
    color: str
    link: str

class HoroscopeData(BaseModel):
    sign: str
    prediction: str

class KundliBirthData(BaseModel):
    name: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    place: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PanchangData(BaseModel):
    date: str
    tithi: str
    nakshatra: str
    yog: str
    karan: str
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    moonrise: Optional[str] = None
    moonset: Optional[str] = None
    auspicious_time: Optional[str] = None
    inauspicious_time: Optional[str] = None
    description: Optional[str] = None

# --- Endpoints ---

@router.get("/today/test")
def test_today():
    return {"message": "Today endpoint is working"}

@router.get("/today/insights")
async def get_today_insights():
    """Get today's astrological insights and guidance"""
    print("[LOG] Today insights endpoint called")
    try:
        from app.services.today_service import today_service
        print("[LOG] Today service imported successfully")
        insights = await today_service.generate_today_insights()
        print(f"[LOG] Today insights generated: {type(insights)}")
        return insights
    except Exception as e:
        print(f"[LOG] Error in today insights: {e}")
        import traceback
        traceback.print_exc()
        raise

@router.get("/kundli/test")
def test_kundli():
    return {"message": "Kundli endpoint is working"}

@router.post("/kundli/generate")
async def generate_kundli(birth_data: KundliBirthData):
    """Generate Brihat Kundli using LLM analysis"""
    # Import here to avoid circular imports
    from app.services.kundli_service import kundli_service
    kundli_data = await kundli_service.generate_brihat_kundli(birth_data.dict())
    return kundli_data

@router.get("/panchang/daily", response_model=PanchangData)
async def get_daily_panchang(date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")):
    """Get daily panchang using OpenAI GenAI with enhanced details"""
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    panchang_data = await openai_service.generate_daily_panchang(date)
    return panchang_data

@router.get("/horoscope/daily", response_model=List[HoroscopeData])
def get_daily_horoscope():
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    return [
        {"sign": sign, "prediction": f"Today is a great day for {sign}. Focus on your goals."}
        for sign in signs
    ]

@router.post("/ai-guru/chat")
async def chat_with_guru(request: ChatRequest):
    """Chat with AI Guru"""
    try:
        # Append the new message to history
        messages = request.history + [{"role": "user", "content": request.message}]
        
        response = await ai_guru_service.get_response(messages)
        
        # Extract the content from OpenRouter response
        try:
            content = response["choices"][0]["message"]["content"]
            return {"response": content}
        except (KeyError, IndexError):
            return {"response": "The spirits are silent right now. Please try again later."}
    except Exception as e:
        print(f"AI Guru Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

@router.get("/news/{news_id}", response_model=NewsOut)
def get_news_item(news_id: int, db: Session = Depends(get_db)):
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="Article not found")
    return news_item

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

@router.get("/services", response_model=List[ServiceItem])
def get_services():
    return [
        {
            "id": 1,
            "title": "Matching",
            "description": "Find your perfect match with our detailed compatibility analysis.",
            "icon_name": "UserGroupIcon",
            "color": "bg-pink-100 text-pink-600",
            "link": "/matching"
        },
        {
            "id": 2,
            "title": "Career",
            "description": "Get insights into your professional life and future opportunities.",
            "icon_name": "BriefcaseIcon",
            "color": "bg-blue-100 text-blue-600",
            "link": "/career"
        },
        {
            "id": 3,
            "title": "Mental Health",
            "description": "Astrological guidance for peace of mind and emotional balance.",
            "icon_name": "SparklesIcon",
            "color": "bg-purple-100 text-purple-600",
            "link": "/mental-health"
        },
        {
            "id": 4,
            "title": "Today",
            "description": "Your daily horoscope and planetary positions.",
            "icon_name": "CalendarIcon",
            "color": "bg-amber-100 text-amber-600",
            "link": "/today"
        },
        {
            "id": 5,
            "title": "Love",
            "description": "Discover what the stars say about your love life.",
            "icon_name": "HeartIcon",
            "color": "bg-red-100 text-red-600",
            "link": "/love"
        },
        {
            "id": 6,
            "title": "Education",
            "description": "Guidance for your academic journey and success.",
            "icon_name": "AcademicCapIcon",
            "color": "bg-green-100 text-green-600",
            "link": "/education"
        },
        {
            "id": 7,
            "title": "Reports",
            "description": "Detailed astrological reports for in-depth analysis.",
            "icon_name": "DocumentTextIcon",
            "color": "bg-indigo-100 text-indigo-600",
            "link": "/brihat-kundli"
        }
    ]

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.schemas.astrologer import AstrologerApplication, AstrologerProfile
from app.schemas.session import Session as SessionSchema
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import Astrologer, User, Session as SessionModel

router = APIRouter()

class StatusUpdate(BaseModel):
    is_online: bool

class RateUpdate(BaseModel):
    rate: float

@router.post("/apply", response_model=AstrologerProfile)
async def apply_astrologer(application: AstrologerApplication, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if already applied
    existing = db.query(Astrologer).filter(Astrologer.email == application.email).first()
    if existing:
         raise HTTPException(status_code=400, detail="Application already exists")

    # Create new astrologer profile
    new_astrologer = Astrologer(
        user_id=current_user.id,
        name=application.name,
        email=application.email,
        phone=application.phone,
        experience=application.experience,
        specialties=application.specialties,
        languages=application.languages,
        bio=application.bio,
        status="pending",
        verification_status="pending",
        rate=10.0,
        rating=0.0,
        total_calls=0,
        earnings=0.0
    )
    
    db.add(new_astrologer)
    db.commit()
    db.refresh(new_astrologer)
    
    return new_astrologer

@router.get("/me", response_model=AstrologerProfile)
async def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    return profile

@router.put("/me/status", response_model=AstrologerProfile)
async def update_status(status_data: StatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.is_online = status_data.is_online
    if status_data.is_online:
        profile.last_online_time = datetime.utcnow()
    
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/me/rate", response_model=AstrologerProfile)
async def update_rate(rate_data: RateUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.rate = rate_data.rate
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/me/boost", response_model=AstrologerProfile)
async def toggle_boost(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.is_boosted = not profile.is_boosted
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/me/live", response_model=AstrologerProfile)
async def toggle_live(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.is_live = not profile.is_live
    # If going live, also go online
    if profile.is_live:
        profile.is_online = True
        profile.last_online_time = datetime.utcnow()
        
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/me/sessions", response_model=List[SessionSchema])
async def get_my_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    # Return active sessions
    sessions = db.query(SessionModel).filter(
        SessionModel.astrologer_id == profile.id,
        SessionModel.status == "active"
    ).all()
    return sessions

@router.get("/", response_model=List[AstrologerProfile])
async def get_all_astrologers(db: Session = Depends(get_db)):
    # Only return approved astrologers
    astrologers = db.query(Astrologer).filter(Astrologer.status == "approved").all()
    return astrologers

@router.get("/{astrologer_id}", response_model=AstrologerProfile)
async def get_astrologer(astrologer_id: str, db: Session = Depends(get_db)):
    if astrologer_id == "ai-astrologer":
         return {
             "name": "AI Astrologer",
             "email": "ai@astroveda.com",
             "experience": 1000,
             "specialties": ["Vedic", "AI"],
             "bio": "I am an AI trained on Vedic scriptures.",
             "languages": ["English", "Hindi", "Sanskrit"],
             "phone": "0000000000",
             "status": "approved",
             "verification_status": "approved",
             "rating": 5.0,
             "total_calls": 10000,
             "earnings": 0,
             "rate": 25.0,
             "id": "ai-astrologer",
             "is_online": True
         }

    # Try to convert to int, since our ID is integer
    try:
        astro_id_int = int(astrologer_id)
        astro = db.query(Astrologer).filter(Astrologer.id == astro_id_int).first()
    except ValueError:
        # If not an integer ID, it won't be found
        astro = None
        
    if not astro:
        raise HTTPException(status_code=404, detail="Astrologer not found")
        
    return astro

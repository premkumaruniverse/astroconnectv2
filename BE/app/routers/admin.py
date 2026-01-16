from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.schemas.astrologer import AstrologerProfile
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import Astrologer, User, Session as SessionModel

router = APIRouter()

def check_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/applications", response_model=List[AstrologerProfile])
async def get_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    # Return all astrologers (or maybe just pending ones if that's what was intended, 
    # but the original code did find({}) so I'll return all)
    return db.query(Astrologer).all()

@router.put("/verify/{email}")
async def verify_astrologer(email: str, status: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    astrologer = db.query(Astrologer).filter(Astrologer.email == email).first()
    
    if not astrologer:
        raise HTTPException(status_code=404, detail="Astrologer not found")
        
    astrologer.status = status
    astrologer.verification_status = status
    db.commit()
    
    return {"message": f"Astrologer {status}"}


@router.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    active_users = db.query(User).filter(User.role == "user").count()
    astrologers = db.query(Astrologer).filter(Astrologer.status == "approved").count()
    total_sessions = db.query(SessionModel).count()
    verification_requests = db.query(Astrologer).filter(Astrologer.status == "pending").count()
    return {
        "active_users": active_users,
        "astrologers": astrologers,
        "total_sessions": total_sessions,
        "verification_requests": verification_requests,
    }

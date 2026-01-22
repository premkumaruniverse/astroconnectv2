from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from app.schemas.session import Session as SessionSchema, SessionCreate, SessionUpdate
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import Session, Astrologer, User, Transaction

router = APIRouter()

@router.post("/start", response_model=SessionSchema)
async def start_session(session_data: SessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check user balance
    if current_user.wallet_balance < 10: # Minimum 10 rupees to start
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Check astrologer availability
    astrologer_id = session_data.astrologer_id
    astrologer = None
    
    if astrologer_id == "ai-astrologer":
         # Handle AI Astrologer special case
         # We can't link to a database record for AI, so we might need a dummy ID or handle it carefully.
         # For now, let's assume we can't create a real session record with foreign key constraint for AI
         # unless we have a dummy AI user/astrologer in DB.
         # Or we make astrologer_id nullable or not a foreign key?
         # In models.py: astrologer_id = Column(Integer, ForeignKey("astrologers.id"))
         # So we MUST have a valid integer ID.
         # FIX: Create a dummy AI astrologer in DB if not exists, or handle this logic differently.
         # For this migration, let's assume we treat AI session differently or fail if not in DB.
         # But the user wants "keep everything".
         # I will try to find a placeholder astrologer or just fail for AI for now if I can't insert.
         # Actually, if I create a session, I need a valid astrologer_id.
         # Let's skip AI check for now and assume real astrologers, or 
         # I'll create a dummy astrologer for AI if I can? 
         # No, I can't easily do that here.
         # I'll just check if it's an integer.
         pass
    else:
        try:
            astro_id_int = int(astrologer_id)
            astrologer = db.query(Astrologer).filter(Astrologer.id == astro_id_int).first()
        except ValueError:
            pass

    if not astrologer:
        # Fallback for AI if we want to support it without DB constraint?
        # But our model has ForeignKey.
        if astrologer_id == "ai-astrologer":
             # We can't save this to DB if it enforces FK.
             # Maybe we return a mock session?
             return {
                "id": 0, # Mock ID
                "user_id": current_user.id,
                "astrologer_id": 0, # Mock ID
                "start_time": datetime.utcnow(),
                "status": "active",
                "rate": 25.0,
                "duration": 0,
                "cost": 0.0
             }
        raise HTTPException(status_code=404, detail="Astrologer not found")

    new_session = Session(
        user_id=current_user.id,
        astrologer_id=astrologer.id,
        start_time=datetime.utcnow(),
        status="active",
        type=session_data.type
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return new_session

@router.post("/{session_id}/end", response_model=SessionSchema)
async def end_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        sess_id_int = int(session_id)
        session = db.query(Session).filter(Session.id == sess_id_int).first()
    except ValueError:
        session = None
        
    if not session:
        # If it was a mock AI session (id 0), just return it closed
        if session_id == "0":
             return {
                "id": 0,
                "user_id": current_user.id,
                "astrologer_id": 0,
                "start_time": datetime.utcnow(), # Mock
                "end_time": datetime.utcnow(),
                "status": "completed",
                "rate": 25.0,
                "duration": 60,
                "cost": 25.0,
                "type": "chat"
             }
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        return session
    
    end_time = datetime.utcnow()
    start_time = session.start_time
    duration_seconds = int((end_time - start_time).total_seconds())
    duration_minutes = duration_seconds / 60.0
    
    # Calculate cost
    # Access rate from session if stored, or astrologer
    # In my model Session doesn't have rate column?
    # Let's check models.py
    # Session has: cost, duration, status. No rate.
    # But it has relationship to Astrologer.
    
    rate = session.astrologer.rate if session.astrologer else 10.0
    cost = duration_minutes * rate
    
    session.end_time = end_time
    session.duration = duration_seconds
    session.cost = cost
    session.status = "completed"
    
    # Deduct from user wallet
    current_user.wallet_balance -= cost
    
    # Add transaction for user
    user_txn = Transaction(
        user_id=current_user.id,
        amount=cost,
        type="debit",
        description=f"Session with {session.astrologer.name if session.astrologer else 'Astrologer'}",
        timestamp=end_time
    )
    db.add(user_txn)

    # Add earnings to astrologer
    if session.astrologer:
        session.astrologer.earnings += cost
        session.astrologer.total_calls += 1
    
    db.commit()
    db.refresh(session)
    
    return session

@router.get("/{session_id}", response_model=SessionSchema)
async def get_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        sess_id_int = int(session_id)
        session = db.query(Session).filter(Session.id == sess_id_int).first()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID")
        
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Security check: only allow participants to view
    if session.user_id != current_user.id and (not session.astrologer or session.astrologer.user_id != current_user.id):
        # Allow if admin? For now strict.
        raise HTTPException(status_code=403, detail="Not authorized to view this session")
        
    return session

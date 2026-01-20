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
    # Check if user has any previous COMPLETED sessions
    completed_sessions_count = db.query(Session).filter(
        Session.user_id == current_user.id, 
        Session.status == "completed"
    ).count()
    
    is_free_trial = completed_sessions_count == 0

    # Check user balance if not free trial
    if not is_free_trial and current_user.wallet_balance < 10: # Minimum 10 rupees to start
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Check astrologer availability
    astrologer_id = session_data.astrologer_id
    astrologer = None
    
    if astrologer_id == "ai-astrologer":
         # Handle AI Astrologer special case
         if astrologer_id == "ai-astrologer":
             return {
                "id": 0, # Mock ID
                "user_id": current_user.id,
                "astrologer_id": 0, # Mock ID
                "start_time": datetime.utcnow(),
                "status": "active",
                "rate": 25.0,
                "duration": 0,
                "cost": 0.0,
                "is_free_trial": False # AI not free? Or maybe it is? Let's say False for now.
             }
    else:
        try:
            astro_id_int = int(astrologer_id)
            astrologer = db.query(Astrologer).filter(Astrologer.id == astro_id_int).first()
        except ValueError:
            pass

    if not astrologer:
        raise HTTPException(status_code=404, detail="Astrologer not found")

    new_session = Session(
        user_id=current_user.id,
        astrologer_id=astrologer.id,
        start_time=datetime.utcnow(),
        status="active",
        type=session_data.type,
        is_free_trial=is_free_trial
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
                "type": "chat",
                "is_free_trial": False
             }
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        return session
    
    end_time = datetime.utcnow()
    start_time = session.start_time
    duration_seconds = int((end_time - start_time).total_seconds())
    duration_minutes = duration_seconds / 60.0
    
    rate = session.astrologer.rate if session.astrologer else 10.0
    
    # Calculate cost with Free Trial Logic
    cost = 0.0
    if session.is_free_trial:
        if duration_minutes > 5:
            billable_minutes = duration_minutes - 5
            cost = billable_minutes * rate
        else:
            cost = 0.0
    else:
        cost = duration_minutes * rate
    
    session.end_time = end_time
    session.duration = duration_seconds
    session.cost = cost
    session.status = "completed"
    
    # Deduct from user wallet
    if cost > 0:
        current_user.wallet_balance -= cost
        
        # Add transaction for user
        user_txn = Transaction(
            user_id=current_user.id,
            amount=cost,
            type="debit",
            description=f"Session with {session.astrologer.name if session.astrologer else 'Astrologer'} ({'Free Trial + Paid' if session.is_free_trial else 'Paid'})",
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

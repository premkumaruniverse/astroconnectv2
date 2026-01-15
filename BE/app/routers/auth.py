from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.schemas.user import UserSignup, Token, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.database import get_db
from app.models import User

router = APIRouter()

@router.post("/signup", response_model=Token)
async def signup(user: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password,
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role, "name": new_user.name},
        expires_delta=access_token_expires
    )
    
    verification_status = None

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": new_user.role,
        "name": new_user.name,
        "id": new_user.id,
        "verification_status": verification_status,
    }

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "name": user.name},
        expires_delta=access_token_expires
    )
    
    verification_status = None
    if user.role == "astrologer":
        if user.astrologer_profile:
            verification_status = user.astrologer_profile.verification_status
        else:
            # If astrologer doesn't have a profile yet, they should be in pending status
            verification_status = "pending"

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "id": user.id,
        "verification_status": verification_status
    }

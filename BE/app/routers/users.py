from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import User
from app.schemas.user import UserPublic

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None

@router.put("/me", response_model=UserPublic)
async def update_user_profile(user_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_data.name:
        current_user.name = user_data.name
    if user_data.date_of_birth:
        current_user.date_of_birth = user_data.date_of_birth
    if user_data.time_of_birth:
        current_user.time_of_birth = user_data.time_of_birth
    if user_data.place_of_birth:
        current_user.place_of_birth = user_data.place_of_birth
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserPublic)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

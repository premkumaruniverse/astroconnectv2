from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import shutil
import os
import uuid
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
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None

@router.put("/me", response_model=UserPublic)
async def update_user_profile(user_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_data.name:
        current_user.name = user_data.name
    if user_data.phone:
        current_user.phone = user_data.phone
    if user_data.gender:
        current_user.gender = user_data.gender
    if user_data.date_of_birth:
        current_user.date_of_birth = user_data.date_of_birth
    if user_data.time_of_birth:
        current_user.time_of_birth = user_data.time_of_birth
    if user_data.place_of_birth:
        current_user.place_of_birth = user_data.place_of_birth
    if user_data.occupation:
        current_user.occupation = user_data.occupation
    if user_data.marital_status:
        current_user.marital_status = user_data.marital_status
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserPublic)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure uploads directory exists
    UPLOAD_DIR = "uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update database
    image_url = f"/uploads/{filename}"
    current_user.profile_image = image_url
    
    # If astrologer, also update astrologer profile
    from app.models import Astrologer
    astro_profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if astro_profile:
        astro_profile.profile_image = image_url

    db.commit()
    return {"image_url": image_url}

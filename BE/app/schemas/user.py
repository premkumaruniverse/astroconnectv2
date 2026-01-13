from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = Field(..., pattern="^(user|astrologer|admin)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    id: int
    verification_status: Optional[str] = None

class UserInDB(BaseModel):
    name: str
    email: str
    role: str
    hashed_password: str
    created_at: str

class UserPublic(BaseModel):
    id: int
    name: str
    email: str
    role: str
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None
    
    class Config:
        from_attributes = True
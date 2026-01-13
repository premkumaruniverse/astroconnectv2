from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime

class AstrologerApplication(BaseModel):
    name: str
    email: str
    experience: int
    specialties: List[str]
    bio: str
    languages: List[str]
    phone: str

class AstrologerProfile(AstrologerApplication):
    status: str = "pending" # pending, approved, rejected
    rating: float = 0.0
    total_calls: int = 0
    earnings: float = 0.0
    rate: float = 10.0 # Default rate per minute
    
    # Dashboard Features
    is_online: bool = False
    is_live: bool = False
    last_online_time: Optional[datetime] = None
    total_login_minutes: int = 0
    is_boosted: bool = False
    followers_count: int = 0
    
    id: Optional[Union[str, int]] = None
    verification_status: Optional[str] = None # To match dashboard property
    application_date: Optional[datetime] = None

    class Config:
        from_attributes = True

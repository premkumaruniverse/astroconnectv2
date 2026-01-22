from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from app.schemas.user import UserPublic
from app.schemas.astrologer import AstrologerProfile

class SessionBase(BaseModel):
    astrologer_id: Union[str, int]
    type: str = "call" # call, chat

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    end_time: datetime

class Session(SessionBase):
    id: int
    user_id: int
    astrologer_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = 0
    cost: Optional[float] = 0.0
    status: str  # active, completed, cancelled
    type: str
    
    user: Optional[UserPublic] = None
    astrologer: Optional[AstrologerProfile] = None

    class Config:
        from_attributes = True

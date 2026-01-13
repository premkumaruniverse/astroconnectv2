from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    user_message: str
    birth_details: Optional[str] = None

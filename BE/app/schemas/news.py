from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NewsBase(BaseModel):
    title: str
    summary: str
    content: str


class NewsCreate(NewsBase):
    pass


class NewsOut(NewsBase):
    id: int
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


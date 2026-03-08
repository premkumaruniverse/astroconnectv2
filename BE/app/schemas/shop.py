from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int = 10
    is_active: bool = True

class ProductCreate(ProductBase):
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None

class ProductOut(ProductBase):
    id: int
    astrologer_id: int
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    product_id: int
    quantity: int = 1
    shipping_address: str

class OrderCreate(OrderBase):
    pass

class OrderOut(OrderBase):
    id: int
    user_id: int
    total_amount: float
    status: str
    order_date: datetime
    product: ProductOut

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    status: str # shipped, delivered, cancelled

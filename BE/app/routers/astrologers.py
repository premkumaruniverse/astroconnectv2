from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.schemas.astrologer import AstrologerApplication, AstrologerProfile
from app.schemas.session import Session as SessionSchema
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import (
    Astrologer,
    User,
    Session as SessionModel,
    Product,
    ProductOrder,
    Transaction,
)
import cloudinary
import cloudinary.uploader

router = APIRouter()

class StatusUpdate(BaseModel):
    is_online: bool

class RateUpdate(BaseModel):
    rate: float


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True


class ProductOrderOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    total_amount: float
    status: str
    created_at: datetime
    product_name: str
    user_name: str
    user_email: str

    class Config:
        from_attributes = True

def settle_due_orders_for_astrologer(profile: Astrologer, db: Session) -> None:
    if not profile or not profile.id:
        return
    now = datetime.utcnow()
    orders = (
        db.query(ProductOrder)
        .filter(
            ProductOrder.astrologer_id == profile.id,
            ProductOrder.status == "paid",
            ProductOrder.settlement_due_date <= now,
        )
        .all()
    )
    if not orders:
        return
    astro_user = db.query(User).filter(User.id == profile.user_id).first()
    for order in orders:
        if not astro_user or order.astrologer_earning_amount <= 0:
            order.status = "settled"
            order.settled_at = now
            continue
        astro_user.wallet_balance += order.astrologer_earning_amount
        txn = Transaction(
            user_id=astro_user.id,
            amount=order.astrologer_earning_amount,
            type="credit",
            description=f"Settlement for product {order.product.name}",
            timestamp=now,
        )
        db.add(txn)
        order.status = "settled"
        order.settled_at = now
    db.commit()


def get_product_earnings(profile: Astrologer, db: Session) -> float:
    if not profile or not profile.id:
        return 0.0
    total = (
        db.query(func.coalesce(func.sum(ProductOrder.astrologer_earning_amount), 0.0))
        .filter(
            ProductOrder.astrologer_id == profile.id,
            ProductOrder.status == "settled",
        )
        .scalar()
    )
    return float(total or 0.0)

@router.post("/apply", response_model=AstrologerProfile)
async def apply_astrologer(application: AstrologerApplication, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if already applied
    existing = db.query(Astrologer).filter(Astrologer.email == application.email).first()
    if existing:
         raise HTTPException(status_code=400, detail="Application already exists")

    # Create new astrologer profile
    new_astrologer = Astrologer(
        user_id=current_user.id,
        name=application.name,
        email=application.email,
        phone=application.phone,
        experience=application.experience,
        specialties=application.specialties,
        languages=application.languages,
        bio=application.bio,
        status="pending",
        verification_status="pending",
        rate=10.0,
        rating=0.0,
        total_calls=0,
        earnings=0.0
    )
    
    db.add(new_astrologer)
    db.commit()
    db.refresh(new_astrologer)
    
    return new_astrologer

@router.get("/me", response_model=AstrologerProfile)
async def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")

    settle_due_orders_for_astrologer(profile, db)
    product_earnings = get_product_earnings(profile, db)
    setattr(profile, "product_earnings", product_earnings)

    return profile

@router.put("/me/status", response_model=AstrologerProfile)
async def update_status(status_data: StatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.is_online = status_data.is_online
    if status_data.is_online:
        profile.last_online_time = datetime.utcnow()
    
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/me/rate", response_model=AstrologerProfile)
async def update_rate(rate_data: RateUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.rate = rate_data.rate
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/me/boost", response_model=AstrologerProfile)
async def toggle_boost(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.is_boosted = not profile.is_boosted
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/me/live", response_model=AstrologerProfile)
async def toggle_live(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    profile.is_live = not profile.is_live
    # If going live, also go online
    if profile.is_live:
        profile.is_online = True
        profile.last_online_time = datetime.utcnow()
        
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/me/sessions", response_model=List[SessionSchema])
async def get_my_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    # Return active sessions
    sessions = db.query(SessionModel).filter(
        SessionModel.astrologer_id == profile.id,
        SessionModel.status == "active"
    ).all()
    return sessions


@router.get("/me/shop/products", response_model=List[ProductOut])
async def get_my_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    products = (
        db.query(Product)
        .filter(Product.astrologer_id == profile.id, Product.is_active == True)
        .order_by(Product.created_at.desc())
        .all()
    )
    return products


@router.get("/me/shop/orders", response_model=List[ProductOrderOut])
async def get_my_shop_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    rows = (
        db.query(
            ProductOrder,
            Product.name.label("product_name"),
            User.name.label("user_name"),
            User.email.label("user_email"),
        )
        .join(Product, ProductOrder.product_id == Product.id)
        .join(User, ProductOrder.user_id == User.id)
        .filter(ProductOrder.astrologer_id == profile.id)
        .order_by(ProductOrder.created_at.desc())
        .all()
    )
    orders: List[ProductOrderOut] = []
    for row in rows:
        order = row[0]
        orders.append(
            ProductOrderOut(
                id=order.id,
                product_id=order.product_id,
                quantity=order.quantity,
                total_amount=order.total_amount,
                status=order.status,
                created_at=order.created_at,
                product_name=row.product_name,
                user_name=row.user_name,
                user_email=row.user_email,
            )
        )
    return orders

@router.post("/me/shop/products", response_model=ProductOut)
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    category: str = Form(None),
    description: str = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")

    image_url = None
    if image is not None:
        try:
            file_bytes = await image.read()
            if file_bytes:
                upload_result = cloudinary.uploader.upload(
                    file_bytes, folder="astro_shop_products"
                )
                image_url = upload_result.get("secure_url")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Image upload failed: {e}",
            )

    product = Product(
        astrologer_id=profile.id,
        name=name,
        description=description,
        price=price,
        image_url=image_url,
        category=category,
        is_active=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/me/shop/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.astrologer_id == profile.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"success": True}

@router.get("/", response_model=List[AstrologerProfile])
async def get_all_astrologers(db: Session = Depends(get_db)):
    # Only return approved astrologers
    astrologers = db.query(Astrologer).filter(Astrologer.status == "approved").all()
    return astrologers

@router.get("/{astrologer_id}", response_model=AstrologerProfile)
async def get_astrologer(astrologer_id: str, db: Session = Depends(get_db)):
    if astrologer_id == "ai-astrologer":
         return {
             "name": "AI Astrologer",
             "email": "ai@astroveda.com",
             "experience": 1000,
             "specialties": ["Vedic", "AI"],
             "bio": "I am an AI trained on Vedic scriptures.",
             "languages": ["English", "Hindi", "Sanskrit"],
             "phone": "0000000000",
             "status": "approved",
             "verification_status": "approved",
             "rating": 5.0,
             "total_calls": 10000,
             "earnings": 0,
             "rate": 25.0,
             "id": "ai-astrologer",
             "is_online": True
         }

    # Try to convert to int, since our ID is integer
    try:
        astro_id_int = int(astrologer_id)
        astro = db.query(Astrologer).filter(Astrologer.id == astro_id_int).first()
    except ValueError:
        # If not an integer ID, it won't be found
        astro = None
        
    if not astro:
        raise HTTPException(status_code=404, detail="Astrologer not found")
        
    return astro

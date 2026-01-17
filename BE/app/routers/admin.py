from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.schemas.astrologer import AstrologerProfile
from app.schemas.news import NewsOut
from app.dependencies import get_current_user
from app.core.database import get_db
from app.models import Astrologer, User, Session as SessionModel, News, ProductOrder, Product, Transaction
import cloudinary
import cloudinary.uploader

router = APIRouter()

def check_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")


@router.post("/shop/settlements/run")
async def run_shop_settlements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_admin(current_user)
    now = datetime.utcnow()
    orders = (
        db.query(ProductOrder)
        .filter(
            ProductOrder.status == "paid",
            ProductOrder.settlement_due_date <= now,
        )
        .all()
    )
    processed = 0
    for order in orders:
        astrologer = (
            db.query(Astrologer)
            .filter(Astrologer.id == order.astrologer_id)
            .first()
        )
        if not astrologer or order.astrologer_earning_amount <= 0:
            order.status = "settled"
            order.settled_at = now
            processed += 1
            continue
        astro_user = (
            db.query(User)
            .filter(User.id == astrologer.user_id)
            .first()
        )
        if not astro_user:
            order.status = "settled"
            order.settled_at = now
            processed += 1
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
        processed += 1
    db.commit()
    return {"processed": processed}

@router.get("/applications", response_model=List[AstrologerProfile])
async def get_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    # Return all astrologers (or maybe just pending ones if that's what was intended, 
    # but the original code did find({}) so I'll return all)
    return db.query(Astrologer).all()

@router.put("/verify/{email}")
async def verify_astrologer(email: str, status: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    astrologer = db.query(Astrologer).filter(Astrologer.email == email).first()
    
    if not astrologer:
        raise HTTPException(status_code=404, detail="Astrologer not found")
        
    astrologer.status = status
    astrologer.verification_status = status
    db.commit()
    
    return {"message": f"Astrologer {status}"}


@router.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    active_users = db.query(User).filter(User.role == "user").count()
    astrologers = db.query(Astrologer).filter(Astrologer.status == "approved").count()
    total_sessions = db.query(SessionModel).count()
    verification_requests = db.query(Astrologer).filter(Astrologer.status == "pending").count()
    shop_revenue = (
        db.query(func.coalesce(func.sum(ProductOrder.total_amount), 0.0))
        .scalar()
    )
    pending_settlements = (
        db.query(ProductOrder)
        .filter(ProductOrder.status == "paid")
        .count()
    )
    return {
        "active_users": active_users,
        "astrologers": astrologers,
        "total_sessions": total_sessions,
        "verification_requests": verification_requests,
        "shop_revenue": float(shop_revenue or 0.0),
        "pending_settlements": pending_settlements,
    }


@router.post("/news", response_model=NewsOut)
async def create_news(
    title: str = Form(...),
    summary: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_admin(current_user)
    try:
        file_bytes = await image.read()
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No image data received",
            )
        upload_result = cloudinary.uploader.upload(file_bytes, folder="latest_news")
        image_url = upload_result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {e}",
        )
    news_item = News(
        title=title,
        summary=summary,
        content=content,
        image_url=image_url,
    )
    db.add(news_item)
    db.commit()
    db.refresh(news_item)
    try:
        from app.notifications import manager
        await manager.broadcast({"type": "news_added", "payload": {"id": news_item.id, "title": news_item.title}})
    except Exception as e:
        print(f"Broadcast error: {e}")
    return news_item


@router.get("/news", response_model=List[NewsOut])
async def list_news(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_admin(current_user)
    return db.query(News).order_by(News.created_at.desc()).all()

@router.delete("/news/{news_id}")
async def delete_news(
    news_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_admin(current_user)
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="News not found")
    db.delete(news_item)
    db.commit()
    try:
        from app.notifications import manager
        await manager.broadcast({"type": "news_deleted", "payload": {"id": news_id}})
    except Exception as e:
        print(f"Broadcast error: {e}")
    return {"success": True}

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models import User, Astrologer, Product, Order, Transaction
from app.schemas.shop import ProductOut, ProductCreate, ProductUpdate, OrderOut, OrderCreate

router = APIRouter()

@router.get("/products", response_model=List[ProductOut])
async def get_products(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category == category)
    return query.all()

@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", response_model=ProductOut)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(10),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "astrologer":
        raise HTTPException(status_code=403, detail="Only astrologers can add products")
    
    astrologer = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not astrologer:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")

    try:
        upload_result = cloudinary.uploader.upload(image.file, folder="astro_shop")
        image_url = upload_result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    new_product = Product(
        astrologer_id=astrologer.id,
        name=name,
        description=description,
        price=price,
        category=category,
        stock=stock,
        image_url=image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    astrologer = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if product.astrologer_id != astrologer.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in product_data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.post("/orders", response_model=OrderOut)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < order_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    total_amount = product.price * order_data.quantity

    if current_user.wallet_balance < total_amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # Deduct from user wallet
    current_user.wallet_balance -= total_amount
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        amount=total_amount,
        type="debit",
        description=f"Purchase of {product.name}"
    )
    db.add(transaction)

    # Create order
    new_order = Order(
        user_id=current_user.id,
        product_id=product.id,
        quantity=order_data.quantity,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        status="pending"
    )
    db.add(new_order)

    # Update stock
    product.stock -= order_data.quantity
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/my-orders", response_model=List[OrderOut])
async def get_my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == current_user.id).all()

@router.get("/astrologer-orders", response_model=List[OrderOut])
async def get_astrologer_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    astrologer = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    if not astrologer:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    
    return db.query(Order).join(Product).filter(Product.astrologer_id == astrologer.id).all()

@router.get("/admin/orders", response_model=List[OrderOut])
async def get_all_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Order).all()

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if authorized (Admin or the Astrologer who owns the product)
    product = db.query(Product).filter(Product.id == order.product_id).first()
    astrologer = db.query(Astrologer).filter(Astrologer.user_id == current_user.id).first()
    
    if current_user.role != "admin" and (not astrologer or product.astrologer_id != astrologer.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    order.status = status
    db.commit()
    return {"message": "Order status updated"}

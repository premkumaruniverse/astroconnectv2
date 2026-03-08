from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    phone = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    time_of_birth = Column(String, nullable=True)
    place_of_birth = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    astrologer_profile = relationship("Astrologer", back_populates="user", uselist=False)
    wallet_balance = Column(Float, default=0.0)
    transactions = relationship("Transaction", back_populates="user")
    sessions_as_user = relationship("Session", back_populates="user", foreign_keys="Session.user_id")
    kundlis = relationship("Kundli", back_populates="user")

class Astrologer(Base):
    __tablename__ = "astrologers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    experience = Column(Integer)
    specialties = Column(ARRAY(String))
    languages = Column(ARRAY(String))
    bio = Column(Text)
    application_date = Column(DateTime, default=datetime.utcnow)
    
    # Professional stats
    status = Column(String, default="pending")  # pending, approved, rejected
    verification_status = Column(String, default="pending")
    rating = Column(Float, default=0.0)
    total_calls = Column(Integer, default=0)
    earnings = Column(Float, default=0.0)
    rate = Column(Float, default=10.0)
    
    # Dashboard Features
    is_online = Column(Boolean, default=False)
    is_live = Column(Boolean, default=False)
    last_online_time = Column(DateTime, nullable=True)
    total_login_minutes = Column(Integer, default=0)
    is_boosted = Column(Boolean, default=False)
    followers_count = Column(Integer, default=0)
    profile_image = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="astrologer_profile")
    sessions_as_astrologer = relationship("Session", back_populates="astrologer", foreign_keys="Session.astrologer_id")
    products = relationship("Product", back_populates="astrologer")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    astrologer_id = Column(Integer, ForeignKey("astrologers.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    status = Column(String, default="active")  # active, completed, cancelled
    type = Column(String, default="call") # call, chat

    # Relationships
    user = relationship("User", back_populates="sessions_as_user", foreign_keys=[user_id])
    astrologer = relationship("Astrologer", back_populates="sessions_as_astrologer", foreign_keys=[astrologer_id])

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    type = Column(String)  # credit, debit
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    astrologer_id = Column(Integer, ForeignKey("astrologers.id"))
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    image_url = Column(String)
    category = Column(String) 
    stock = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    astrologer = relationship("Astrologer", back_populates="products")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    total_amount = Column(Float)
    status = Column(String, default="pending") # pending, shipped, delivered, cancelled
    order_date = Column(DateTime, default=datetime.utcnow)
    shipping_address = Column(Text)

    # Relationships
    user = relationship("User")
    product = relationship("Product")

class Kundli(Base):
    __tablename__ = "kundlis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String)
    dob = Column(String)
    tob = Column(String)
    pob = Column(String)
    report_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="kundlis")

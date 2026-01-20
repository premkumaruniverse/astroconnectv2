from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY, Text, Boolean
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
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    astrologer_profile = relationship("Astrologer", back_populates="user", uselist=False)
    wallet_balance = Column(Float, default=0.0)
    transactions = relationship("Transaction", back_populates="user")
    sessions_as_user = relationship("Session", back_populates="user", foreign_keys="Session.user_id")

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

    # Relationships
    user = relationship("User", back_populates="astrologer_profile")
    sessions_as_astrologer = relationship("Session", back_populates="astrologer", foreign_keys="Session.astrologer_id")

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
    is_free_trial = Column(Boolean, default=False)

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

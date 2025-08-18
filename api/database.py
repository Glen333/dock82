#!/usr/bin/env python3
"""
Database configuration and models for dock rental app
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json

# Database URL from environment variable (Vercel will provide this)
DATABASE_URL = os.getenv('POSTGRES_URL', 'postgresql://localhost/dock_rental')

# Create engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String)
    user_type = Column(String, default='renter')  # 'renter' or 'homeowner' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = relationship("Booking", back_populates="user")

class Slip(Base):
    __tablename__ = "slips"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    max_length = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    depth = Column(Float, nullable=False)
    price_per_night = Column(Float, nullable=False)
    amenities = Column(Text)  # JSON string
    description = Column(Text)
    dock_etiquette = Column(Text)
    available = Column(Boolean, default=True)
    images = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = relationship("Booking", back_populates="slip")
    
    def get_amenities_list(self):
        """Convert amenities JSON string to list"""
        if self.amenities:
            return json.loads(self.amenities)
        return []
    
    def set_amenities_list(self, amenities_list):
        """Convert amenities list to JSON string"""
        self.amenities = json.dumps(amenities_list)
    
    def get_images_list(self):
        """Convert images JSON string to list"""
        if self.images:
            return json.loads(self.images)
        return []
    
    def set_images_list(self, images_list):
        """Convert images list to JSON string"""
        self.images = json.dumps(images_list)

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    slip_id = Column(Integer, ForeignKey("slips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    guest_name = Column(String, nullable=False)
    guest_email = Column(String, nullable=False)
    guest_phone = Column(String)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    boat_length = Column(Float)
    boat_make_model = Column(String)
    user_type = Column(String, default='renter')
    nights = Column(Integer, nullable=False)
    total_cost = Column(Float, nullable=False)
    status = Column(String, default='pending')  # 'pending', 'confirmed', 'cancelled'
    booking_date = Column(DateTime, default=datetime.utcnow)
    payment_status = Column(String, default='pending')  # 'pending', 'paid', 'scheduled', 'exempt'
    payment_method = Column(String, default='stripe')
    payment_date = Column(DateTime)
    rental_agreement_name = Column(String)
    insurance_proof_name = Column(String)
    rental_property = Column(String)
    rental_start_date = Column(DateTime)
    rental_end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    slip = relationship("Slip", back_populates="bookings")
    user = relationship("User", back_populates="bookings")

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database with sample data
def init_db():
    db = SessionLocal()
    try:
        # Check if we already have data
        if db.query(Slip).count() > 0:
            return  # Already initialized
        
        # Create sample slips
        sample_slips = [
            {
                'name': 'Dockmaster Slip',
                'max_length': 26.0,
                'width': 10.0,
                'depth': 6.0,
                'price_per_night': 60.0,
                'amenities': ['Water', 'Electric (120V)'],
                'description': 'Prime waterfront slip with easy access to main channel',
                'dock_etiquette': 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We\'re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon\'t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don\'t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
                'available': True,
                'images': ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center']
            },
            {
                'name': 'Slip 2',
                'max_length': 26.0,
                'width': 10.0,
                'depth': 6.0,
                'price_per_night': 60.0,
                'amenities': ['Water', 'Electric (120V)'],
                'description': 'Convenient slip close to parking area',
                'dock_etiquette': 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We\'re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon\'t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don\'t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
                'available': False,
                'images': ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center']
            }
        ]
        
        for slip_data in sample_slips:
            slip = Slip(
                name=slip_data['name'],
                max_length=slip_data['max_length'],
                width=slip_data['width'],
                depth=slip_data['depth'],
                price_per_night=slip_data['price_per_night'],
                description=slip_data['description'],
                dock_etiquette=slip_data['dock_etiquette'],
                available=slip_data['available']
            )
            slip.set_amenities_list(slip_data['amenities'])
            slip.set_images_list(slip_data['images'])
            db.add(slip)
        
        # Create admin user
        admin_user = User(
            name='Admin User',
            email='admin@dock82.com',
            password_hash='admin_hash_placeholder',  # In production, use proper hashing
            user_type='admin',
            phone='555-0123'
        )
        db.add(admin_user)
        
        db.commit()
        print("Database initialized with sample data")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

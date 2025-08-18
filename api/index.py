#!/usr/bin/env python3
"""
Vercel serverless function handler for dock rental API
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import stripe
from datetime import datetime
import hashlib
from database import get_db, User, Slip, Booking, create_tables, init_db

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
if not stripe.api_key:
    raise ValueError("STRIPE_SECRET_KEY environment variable is required")

# Initialize database tables
try:
    create_tables()
    init_db()
except Exception as e:
    print(f"Database initialization error: {e}")

class handler(BaseHTTPRequestHandler):
    def _set_security_headers(self):
        """Set security headers for all responses"""
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Content-Security-Policy', "default-src 'self'")
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self._set_security_headers()
        self.end_headers()
        
        if self.path == '/api/health':
            response = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'message': 'Dock Rental API is working!'
            }
        elif self.path == '/api/debug/status':
            response = {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'stripe_configured': bool(stripe.api_key),
                'stripe_key_prefix': stripe.api_key[:20] + '...' if stripe.api_key else None,
                'message': 'Dock Rental API is running on Vercel'
            }
        elif self.path == '/api/slips':
            # Return all slips data from database
            try:
                db = next(get_db())
                slips = db.query(Slip).all()
                
                slips_data = []
                for slip in slips:
                    slip_dict = {
                        'id': slip.id,
                        'name': slip.name,
                        'maxLength': slip.max_length,
                        'width': slip.width,
                        'depth': slip.depth,
                        'pricePerNight': slip.price_per_night,
                        'amenities': slip.get_amenities_list(),
                        'description': slip.description,
                        'dockEtiquette': slip.dock_etiquette,
                        'available': slip.available,
                        'images': slip.get_images_list(),
                        'bookings': []
                    }
                    slips_data.append(slip_dict)
                
                response = {'slips': slips_data}
            except Exception as e:
                response = {
                    'error': 'Failed to fetch slips',
                    'message': str(e)
                }
        elif self.path == '/api/users':
            # Return all users data from database
            try:
                db = next(get_db())
                users = db.query(User).all()
                
                users_data = []
                for user in users:
                    user_dict = {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'userType': user.user_type,
                        'phone': user.phone,
                        'createdAt': user.created_at.isoformat() if user.created_at else None
                    }
                    users_data.append(user_dict)
                
                response = {'users': users_data}
            except Exception as e:
                response = {
                    'error': 'Failed to fetch users',
                    'message': str(e)
                }
        elif self.path == '/api/bookings':
            # Return all bookings data from database
            try:
                db = next(get_db())
                bookings = db.query(Booking).all()
                
                bookings_data = []
                for booking in bookings:
                    booking_dict = {
                        'id': booking.id,
                        'slipId': booking.slip_id,
                        'slipName': booking.slip.name if booking.slip else None,
                        'guestName': booking.guest_name,
                        'guestEmail': booking.guest_email,
                        'guestPhone': booking.guest_phone,
                        'checkIn': booking.check_in.isoformat() if booking.check_in else None,
                        'checkOut': booking.check_out.isoformat() if booking.check_out else None,
                        'boatLength': booking.boat_length,
                        'boatMakeModel': booking.boat_make_model,
                        'userType': booking.user_type,
                        'nights': booking.nights,
                        'totalCost': booking.total_cost,
                        'status': booking.status,
                        'bookingDate': booking.booking_date.isoformat() if booking.booking_date else None,
                        'paymentStatus': booking.payment_status,
                        'paymentDate': booking.payment_date.isoformat() if booking.payment_date else None,
                        'paymentMethod': booking.payment_method,
                        'rentalAgreementName': booking.rental_agreement_name,
                        'insuranceProofName': booking.insurance_proof_name,
                        'rentalProperty': booking.rental_property,
                        'rentalStartDate': booking.rental_start_date.isoformat() if booking.rental_start_date else None,
                        'rentalEndDate': booking.rental_end_date.isoformat() if booking.rental_end_date else None
                    }
                    bookings_data.append(booking_dict)
                
                response = {'bookings': bookings_data}
            except Exception as e:
                response = {
                    'error': 'Failed to fetch bookings',
                    'message': str(e)
                }
        else:
            response = {
                'error': 'Endpoint not found',
                'path': self.path
            }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self._set_security_headers()
        self.end_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        if self.path == '/api/create-payment-intent':
            try:
                amount = data.get('amount', 1000)
                payment_intent = stripe.PaymentIntent.create(
                    amount=amount,
                    currency='usd',
                    metadata={'source': 'dock-rental-app'}
                )
                response = {
                    'client_secret': payment_intent.client_secret,
                    'payment_intent_id': payment_intent.id
                }
            except Exception as e:
                response = {
                    'error': 'Payment intent creation failed',
                    'message': str(e)
                }
        
        elif self.path == '/api/confirm-payment':
            try:
                payment_intent_id = data.get('payment_intent_id')
                if not payment_intent_id:
                    response = {'error': 'Payment intent ID is required'}
                else:
                    payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                    response = {
                        'status': payment_intent.status,
                        'amount': payment_intent.amount,
                        'currency': payment_intent.currency
                    }
            except Exception as e:
                response = {
                    'error': 'Payment confirmation failed',
                    'message': str(e)
                }
        
        elif self.path == '/api/update-slip-images':
            try:
                slip_id = data.get('slip_id')
                image_url = data.get('image_url')
                
                if not slip_id or not image_url:
                    response = {'error': 'slip_id and image_url are required'}
                else:
                    # In a real app, this would save to a database
                    # For now, we'll just return success
                    response = {
                        'success': True,
                        'message': f'Slip {slip_id} image updated successfully',
                        'slip_id': slip_id,
                        'image_url': image_url
                    }
            except Exception as e:
                response = {
                    'error': 'Failed to update slip image',
                    'message': str(e)
                }
        
        elif self.path == '/api/update-all-slip-images':
            try:
                image_url = data.get('image_url')
                
                if not image_url:
                    response = {'error': 'image_url is required'}
                else:
                    # In a real app, this would update all slips in a database
                    # For now, we'll just return success
                    response = {
                        'success': True,
                        'message': 'All slip images updated successfully',
                        'image_url': image_url,
                        'updated_count': 12  # Assuming 12 slips
                    }
            except Exception as e:
                response = {
                    'error': 'Failed to update all slip images',
                    'message': str(e)
                }
        
        elif self.path == '/api/register-user':
            try:
                name = data.get('name')
                email = data.get('email')
                password = data.get('password')
                phone = data.get('phone', '')
                user_type = data.get('userType', 'renter')
                
                if not name or not email or not password:
                    response = {'error': 'name, email, and password are required'}
                else:
                    db = next(get_db())
                    
                    # Check if user already exists
                    existing_user = db.query(User).filter(User.email == email).first()
                    if existing_user:
                        response = {'error': 'User with this email already exists'}
                    else:
                        # Hash the password
                        password_hash = hashlib.sha256(password.encode()).hexdigest()
                        
                        # Create new user
                        new_user = User(
                            name=name,
                            email=email,
                            password_hash=password_hash,
                            phone=phone,
                            user_type=user_type
                        )
                        
                        db.add(new_user)
                        db.commit()
                        db.refresh(new_user)
                        
                        response = {
                            'success': True,
                            'message': 'User registered successfully',
                            'user': {
                                'id': new_user.id,
                                'name': new_user.name,
                                'email': new_user.email,
                                'phone': new_user.phone,
                                'userType': new_user.user_type,
                                'createdAt': new_user.created_at.isoformat() if new_user.created_at else None
                            }
                        }
            except Exception as e:
                response = {
                    'error': 'Failed to register user',
                    'message': str(e)
                }
        
        elif self.path == '/api/login-user':
            try:
                email = data.get('email')
                password = data.get('password')
                
                if not email or not password:
                    response = {'error': 'email and password are required'}
                else:
                    db = next(get_db())
                    
                    # Hash the password for comparison
                    password_hash = hashlib.sha256(password.encode()).hexdigest()
                    
                    # Find user by email
                    user = db.query(User).filter(User.email == email).first()
                    
                    if user and user.password_hash == password_hash:
                        response = {
                            'success': True,
                            'message': 'Login successful',
                            'user': {
                                'id': user.id,
                                'name': user.name,
                                'email': user.email,
                                'phone': user.phone,
                                'userType': user.user_type,
                                'createdAt': user.created_at.isoformat() if user.created_at else None
                            }
                        }
                    else:
                        response = {'error': 'Invalid credentials'}
            except Exception as e:
                response = {
                    'error': 'Failed to login user',
                    'message': str(e)
                }
        
        elif self.path == '/api/create-booking':
            try:
                booking_data = data.get('booking')
                
                if not booking_data:
                    response = {'error': 'booking data is required'}
                else:
                    db = next(get_db())
                    
                    # Parse dates
                    check_in = datetime.fromisoformat(booking_data['checkIn'].replace('Z', '+00:00'))
                    check_out = datetime.fromisoformat(booking_data['checkOut'].replace('Z', '+00:00'))
                    booking_date = datetime.fromisoformat(booking_data['bookingDate'].replace('Z', '+00:00'))
                    
                    # Parse optional dates
                    payment_date = None
                    rental_start_date = None
                    rental_end_date = None
                    
                    if booking_data.get('paymentDate'):
                        payment_date = datetime.fromisoformat(booking_data['paymentDate'].replace('Z', '+00:00'))
                    if booking_data.get('rentalStartDate'):
                        rental_start_date = datetime.fromisoformat(booking_data['rentalStartDate'].replace('Z', '+00:00'))
                    if booking_data.get('rentalEndDate'):
                        rental_end_date = datetime.fromisoformat(booking_data['rentalEndDate'].replace('Z', '+00:00'))
                    
                    # Create new booking
                    new_booking = Booking(
                        slip_id=booking_data['slipId'],
                        user_id=booking_data.get('userId', 1),  # Default to user 1 if not provided
                        guest_name=booking_data['guestName'],
                        guest_email=booking_data['guestEmail'],
                        guest_phone=booking_data.get('guestPhone'),
                        check_in=check_in,
                        check_out=check_out,
                        boat_length=booking_data.get('boatLength'),
                        boat_make_model=booking_data.get('boatMakeModel'),
                        user_type=booking_data.get('userType', 'renter'),
                        nights=booking_data['nights'],
                        total_cost=booking_data['totalCost'],
                        status=booking_data.get('status', 'pending'),
                        booking_date=booking_date,
                        payment_status=booking_data.get('paymentStatus', 'pending'),
                        payment_method=booking_data.get('paymentMethod', 'stripe'),
                        payment_date=payment_date,
                        rental_agreement_name=booking_data.get('rentalAgreementName'),
                        insurance_proof_name=booking_data.get('insuranceProofName'),
                        rental_property=booking_data.get('rentalProperty'),
                        rental_start_date=rental_start_date,
                        rental_end_date=rental_end_date
                    )
                    
                    db.add(new_booking)
                    db.commit()
                    db.refresh(new_booking)
                    
                    response = {
                        'success': True,
                        'message': 'Booking created successfully',
                        'booking': {
                            'id': new_booking.id,
                            'slipId': new_booking.slip_id,
                            'slipName': new_booking.slip.name if new_booking.slip else None,
                            'guestName': new_booking.guest_name,
                            'guestEmail': new_booking.guest_email,
                            'guestPhone': new_booking.guest_phone,
                            'checkIn': new_booking.check_in.isoformat() if new_booking.check_in else None,
                            'checkOut': new_booking.check_out.isoformat() if new_booking.check_out else None,
                            'boatLength': new_booking.boat_length,
                            'boatMakeModel': new_booking.boat_make_model,
                            'userType': new_booking.user_type,
                            'nights': new_booking.nights,
                            'totalCost': new_booking.total_cost,
                            'status': new_booking.status,
                            'bookingDate': new_booking.booking_date.isoformat() if new_booking.booking_date else None,
                            'paymentStatus': new_booking.payment_status,
                            'paymentDate': new_booking.payment_date.isoformat() if new_booking.payment_date else None,
                            'paymentMethod': new_booking.payment_method,
                            'rentalAgreementName': new_booking.rental_agreement_name,
                            'insuranceProofName': new_booking.insurance_proof_name,
                            'rentalProperty': new_booking.rental_property,
                            'rentalStartDate': new_booking.rental_start_date.isoformat() if new_booking.rental_start_date else None,
                            'rentalEndDate': new_booking.rental_end_date.isoformat() if new_booking.rental_end_date else None
                        }
                    }
            except Exception as e:
                response = {
                    'error': 'Failed to create booking',
                    'message': str(e)
                }
        
        else:
            response = {
                'error': 'Endpoint not found',
                'path': self.path
            }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self._set_security_headers()
        self.end_headers()
        self.wfile.write(b'') 
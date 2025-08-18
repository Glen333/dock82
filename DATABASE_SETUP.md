# 🗄️ Database Setup for Dock Rental App

## Overview
This app now uses a **PostgreSQL database** for persistent data storage, replacing the previous localStorage approach. All user data, bookings, and slip information are now stored securely in the cloud.

## 🚀 Quick Setup

### 1. Create PostgreSQL Database in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dock-rental-vercel` project
3. Go to **Storage** tab
4. Click **"Create Database"**
5. Choose **PostgreSQL**
6. Select your preferred region
7. Click **"Create"**

### 2. Deploy Your App
```bash
vercel --prod
```

The database tables will be created automatically on first deployment.

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    phone VARCHAR,
    user_type VARCHAR DEFAULT 'renter',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Slips Table
```sql
CREATE TABLE slips (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    max_length FLOAT NOT NULL,
    width FLOAT NOT NULL,
    depth FLOAT NOT NULL,
    price_per_night FLOAT NOT NULL,
    amenities TEXT, -- JSON string
    description TEXT,
    dock_etiquette TEXT,
    available BOOLEAN DEFAULT TRUE,
    images TEXT, -- JSON string
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    slip_id INTEGER REFERENCES slips(id),
    user_id INTEGER REFERENCES users(id),
    guest_name VARCHAR NOT NULL,
    guest_email VARCHAR NOT NULL,
    guest_phone VARCHAR,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NOT NULL,
    boat_length FLOAT,
    boat_make_model VARCHAR,
    user_type VARCHAR DEFAULT 'renter',
    nights INTEGER NOT NULL,
    total_cost FLOAT NOT NULL,
    status VARCHAR DEFAULT 'pending',
    booking_date TIMESTAMP DEFAULT NOW(),
    payment_status VARCHAR DEFAULT 'pending',
    payment_method VARCHAR DEFAULT 'stripe',
    payment_date TIMESTAMP,
    rental_agreement_name VARCHAR,
    insurance_proof_name VARCHAR,
    rental_property VARCHAR,
    rental_start_date TIMESTAMP,
    rental_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 API Endpoints

### User Management
- `POST /api/register-user` - Register new user
- `POST /api/login-user` - User login
- `GET /api/users` - Get all users

### Booking Management
- `POST /api/create-booking` - Create new booking
- `GET /api/bookings` - Get all bookings

### Slip Management
- `GET /api/slips` - Get all slips
- `POST /api/update-all-slip-images` - Update slip images

## 🔒 Security Features

### Password Security
- Passwords are hashed using SHA-256
- Never stored in plain text
- Secure comparison for login

### SQL Injection Protection
- Uses SQLAlchemy ORM
- Parameterized queries
- Input validation

### Environment Variables
- Database URL stored securely
- No hardcoded credentials
- Vercel-managed secrets

## 📊 Sample Data

The database is initialized with:

### Sample Slips
1. **Dockmaster Slip**
   - 26ft max length
   - $60/night
   - Water & Electric
   - Available

2. **Slip 2**
   - 26ft max length
   - $60/night
   - Water & Electric
   - Occupied

### Admin User
- Email: `admin@dock82.com`
- Type: Admin
- Full system access

## 🚀 Deployment

### Automatic Setup
1. Database tables created on first deployment
2. Sample data initialized automatically
3. Environment variables configured by Vercel

### Manual Verification
```bash
# Test API endpoints
curl -X GET "https://your-app.vercel.app/api/slips"
curl -X GET "https://your-app.vercel.app/api/users"
curl -X GET "https://your-app.vercel.app/api/bookings"
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check POSTGRES_URL environment variable
   - Verify database is created in Vercel
   - Check database region settings

2. **Table Creation Failed**
   - Check database permissions
   - Verify SQLAlchemy dependencies
   - Check Vercel function logs

3. **Data Not Persisting**
   - Verify database connection
   - Check API response for errors
   - Ensure proper error handling

### Debug Commands
```bash
# Check environment variables
vercel env ls

# View function logs
vercel logs

# Test database connection
curl -X GET "https://your-app.vercel.app/api/health"
```

## 📈 Performance

### Database Optimization
- Indexed primary keys
- Foreign key relationships
- Efficient queries via ORM
- Connection pooling

### Scalability
- Vercel-managed PostgreSQL
- Automatic scaling
- Built-in backups
- High availability

## 🔄 Migration from localStorage

The app automatically migrates from localStorage to database:
1. Existing localStorage data is preserved
2. New data goes to database
3. Gradual migration as users interact
4. No data loss during transition

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify database connection
3. Test API endpoints individually
4. Review environment variables

---

**Ready to deploy?** Run `./setup-database.sh` for step-by-step guidance!

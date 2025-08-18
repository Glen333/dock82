# 🗄️ **Complete Database Setup Guide**

## 🎯 **What We've Built**

Your dock rental app now uses a **production-ready PostgreSQL database** with full SQL functionality:

### ✅ **Features Implemented:**
- **Real PostgreSQL Database** - No more localStorage
- **Node.js API Routes** - Fast, scalable backend
- **Full CRUD Operations** - Create, Read, Update, Delete
- **User Authentication** - Secure login/registration
- **Booking Management** - Complete booking lifecycle
- **Slip Management** - Dynamic slip data
- **Data Persistence** - All data saved to database
- **Security** - Password hashing, SQL injection protection

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Create PostgreSQL Database**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dock-rental-vercel` project
3. Go to **Storage** tab
4. Click **"Create Database"**
5. Choose **PostgreSQL**
6. Select region (closest to your users)
7. Click **"Create"**

### **Step 2: Deploy Your App**
```bash
vercel --prod
```

### **Step 3: Initialize Database**
Visit: `https://your-app.vercel.app/api/init` with POST request:
```bash
curl -X POST https://your-app.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"action": "init-database"}'
```

## 📊 **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  user_type VARCHAR(50) DEFAULT 'renter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Slips Table**
```sql
CREATE TABLE slips (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  max_length DECIMAL(5,2) NOT NULL,
  width DECIMAL(5,2) NOT NULL,
  depth DECIMAL(5,2) NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  amenities JSONB,
  description TEXT,
  dock_etiquette TEXT,
  available BOOLEAN DEFAULT TRUE,
  images JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Bookings Table**
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  slip_id INTEGER REFERENCES slips(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  boat_length DECIMAL(5,2),
  boat_make_model VARCHAR(255),
  user_type VARCHAR(50) DEFAULT 'renter',
  nights INTEGER NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'stripe',
  payment_date TIMESTAMP,
  rental_agreement_name VARCHAR(255),
  insurance_proof_name VARCHAR(255),
  rental_property VARCHAR(255),
  rental_start_date TIMESTAMP,
  rental_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 **API Endpoints**

### **User Management**
- `POST /api/users` - Register/Login users
- `GET /api/users` - Get all users

### **Slip Management**
- `GET /api/slips` - Get all slips
- `POST /api/slips` - Update slip images

### **Booking Management**
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking

### **Database Setup**
- `POST /api/init` - Initialize database

## 🔒 **Security Features**

### **Password Security**
- SHA-256 hashing
- Never stored in plain text
- Secure comparison

### **SQL Injection Protection**
- Parameterized queries
- Input validation
- ORM protection

### **Data Validation**
- Server-side validation
- Type checking
- Constraint enforcement

## 📈 **Performance Optimizations**

### **Database Indexes**
- Email index for fast user lookup
- Slip ID index for booking queries
- Date range indexes for availability checks

### **Connection Pooling**
- Vercel-managed connections
- Automatic scaling
- Efficient resource usage

## 🧪 **Testing Your Setup**

### **1. Test User Registration**
```bash
curl -X POST https://your-app.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "555-0123",
    "userType": "renter"
  }'
```

### **2. Test User Login**
```bash
curl -X POST https://your-app.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **3. Test Slip Data**
```bash
curl -X GET https://your-app.vercel.app/api/slips
```

### **4. Test Booking Creation**
```bash
curl -X POST https://your-app.vercel.app/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slipId": 1,
    "userId": 1,
    "guestName": "Test Guest",
    "guestEmail": "guest@example.com",
    "checkIn": "2024-01-15T00:00:00Z",
    "checkOut": "2024-01-17T00:00:00Z",
    "nights": 2,
    "totalCost": 120.00
  }'
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   - Check POSTGRES_URL environment variable
   - Verify database is created in Vercel
   - Check database region settings

2. **API Routes Not Working**
   - Verify deployment completed successfully
   - Check Vercel function logs
   - Test individual endpoints

3. **Data Not Persisting**
   - Check database initialization
   - Verify API responses
   - Check for JavaScript errors

### **Debug Commands**
```bash
# Check environment variables
vercel env ls

# View function logs
vercel logs

# Test database connection
curl -X GET https://your-app.vercel.app/api/slips
```

## 🚀 **Next Steps**

### **Immediate Actions**
1. ✅ Create PostgreSQL database in Vercel
2. ✅ Deploy your app
3. ✅ Initialize database
4. ✅ Test all functionality

### **Future Enhancements**
- Add user sessions (JWT tokens)
- Implement email notifications
- Add payment processing
- Create admin dashboard
- Add analytics and reporting

## 📞 **Support**

If you encounter issues:
1. Check Vercel function logs
2. Verify database connection
3. Test API endpoints individually
4. Review environment variables

---

**🎉 Congratulations!** Your dock rental app now has a production-ready database system that can handle real users, bookings, and data persistence.

# 🚢 Dock82 - Professional Dock Rental Management Platform

A modern, full-stack web application for managing dock slip rentals with real-time booking, payment processing, and administrative controls.

## ✨ Features

### 🏠 **For Renters**
- Browse available dock slips with detailed information
- Real-time availability checking
- Secure online booking with Stripe payment processing
- 30-day booking limit with 40% discount for extended stays
- Email notifications and booking confirmations
- User account management with password saving

### 👨‍💼 **For Administrators**
- Complete slip management (pricing, availability, descriptions)
- JPEG image upload and storage for each slip
- User management and booking oversight
- Real-time analytics and revenue tracking
- Bulk operations for slip management
- Email etiquette notifications

### 🔐 **Authentication & Security**
- Supabase Auth integration with email verification
- Role-based access control (Superadmin, Admin, Renter)
- Secure password management with Chrome integration
- JWT token-based authentication

## 🛠️ Technology Stack

### **Frontend**
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Stripe.js** - Payment processing
- **Lucide React** - Icon library

### **Backend**
- **Node.js** - Serverless functions (Vercel)
- **Python** - Alternative API endpoints
- **Supabase** - Database and authentication
- **PostgreSQL** - Primary database

### **Deployment**
- **Vercel** - Hosting and serverless deployment
- **GitHub** - Version control and collaboration

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Stripe account
- Vercel account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dock82.git
   cd dock82
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   REACT_APP_API_URL=your_vercel_deployment_url
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL scripts in `supabase-setup.sql`
   - Configure authentication settings

5. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## 📁 Project Structure

```
dock82/
├── api/                    # Backend API endpoints
│   ├── admin.js           # Admin management
│   ├── bookings.js        # Booking operations
│   ├── slips.js           # Slip management
│   ├── users.js           # User authentication
│   └── upload-image.js    # Image upload handling
├── src/                   # Frontend React components
│   ├── DockRentalPlatform.js  # Main application
│   ├── PaymentPage.js     # Stripe payment integration
│   └── supabase.js        # Supabase client
├── public/                # Static assets
├── sql/                   # Database setup scripts
└── docs/                  # Documentation
```

## 🔧 Configuration

### **Database Setup**
Run the SQL scripts in order:
1. `supabase-setup.sql` - Core database schema
2. `create-superadmin.sql` - Initial admin user
3. `setup-storage.sql` - Image storage configuration

### **Environment Variables**
Required environment variables for production:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 👥 User Roles

### **Superadmin**
- Full system access
- User management
- System configuration
- Analytics and reporting

### **Admin**
- Slip management
- Booking oversight
- User support
- Limited system access

### **Renter**
- Browse slips
- Make bookings
- Manage personal account
- View booking history

## 💳 Payment Integration

The platform uses Stripe for secure payment processing:
- Real-time payment validation
- Automatic booking confirmation
- Refund processing
- Payment analytics

## 📸 Image Management

- JPEG image upload for each slip
- Base64 storage in database
- Automatic image optimization
- Admin-controlled image management

## 🔒 Security Features

- Email verification for new accounts
- Password strength requirements
- JWT token authentication
- CORS protection
- Input validation and sanitization

## 🧪 Testing

Run the comprehensive test suite:
```bash
# Test database connection
./test-database.sh

# Test login flow
./test-login.sh

# Test connected system
./test-connected-system.sh
```

## 📊 Analytics

The platform provides real-time analytics:
- Revenue tracking
- Booking statistics
- User activity monitoring
- Slip utilization rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `docs/` folder
- Review the comprehensive test plans

## 🚀 Deployment

The application is designed for deployment on Vercel:
- Automatic builds from GitHub
- Environment variable management
- Serverless function optimization
- Global CDN distribution

---

**Built with ❤️ for the Dock82 community**

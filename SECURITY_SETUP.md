# Security Setup Guide

This document outlines the comprehensive security implementation for the Dock Rental Platform.

## Database Security

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

#### Users Table
- **Select**: Users can only see their own profile (`auth.uid() = auth_user_id`)
- **Update**: Users can only update their own profile

#### Slips Table  
- **Select**: Public read access (anyone can view slip availability)
- **Insert/Update/Delete**: Admin only (handled via service role in API)

#### Bookings Table
- **Select**: Users can read their own bookings by:
  - `renter_auth_id` matching their auth ID
  - `guest_email` matching their user email
- **Insert**: Users can create bookings for themselves or as homeowners
- **Update**: Users can update their own bookings (for cancellations, etc.)

### Database Constraints

#### Business Rule Enforcement
1. **26' Hard Limit**: `boat_length <= 26` on all bookings
2. **Valid Dates**: `check_out > check_in` constraint
3. **30-Night Limit**: Renters limited to 30 nights maximum
4. **Overlap Prevention**: No double-booking of confirmed slips
5. **7-Day Window**: Renters can only book dock within 7 days of rental start

#### Performance Indexes
- `idx_bookings_slip_dates` on `bookings(slip_id, check_in, check_out)`
- `idx_bookings_renter` on `bookings(renter_auth_id)`
- `idx_bookings_status` on `bookings(status)`
- `idx_users_email` on `users(email)`
- `idx_slips_available` on `slips(available)`

## API Security

### Authentication Flow
- **Frontend**: Uses anon key with RLS policies
- **API Endpoints**: Use service role key to bypass RLS for admin operations
- **User Authentication**: Handled via Supabase Auth

### API Endpoints Security
- All endpoints use service role key for database operations
- CORS headers configured for cross-origin requests
- Input validation and sanitization
- Error handling with meaningful messages

## Environment Variables

### Required Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Data Access Patterns

### User Data Access
- Users can only access their own profile data
- Authentication required for all user operations
- Email verification required for account activation

### Booking Data Access
- Users can view their own bookings
- Users can create new bookings
- Users can cancel/modify their own bookings
- Admins can view all bookings via service role

### Slip Data Access
- Public read access for slip availability
- Admin-only write access for slip management
- Real-time updates for availability changes

## Security Best Practices

### Database Level
- All business rules enforced at database level
- RLS policies prevent unauthorized data access
- Constraints prevent invalid data entry
- Triggers maintain data consistency

### Application Level
- Input validation on all forms
- Error handling with appropriate user messages
- Secure file upload handling
- Payment processing via Stripe

### Deployment Level
- Environment variables properly configured
- CORS policies implemented
- HTTPS enforcement
- Content Security Policy headers

## Implementation Steps

1. **Run Database Setup**:
   ```sql
   -- Execute the database-constraints.sql file
   \i database-constraints.sql
   ```

2. **Configure Environment Variables**:
   - Set all required environment variables in Vercel dashboard
   - Ensure service role key is properly configured

3. **Test Security Policies**:
   - Verify RLS policies work correctly
   - Test constraint violations
   - Validate user access patterns

4. **Monitor and Maintain**:
   - Regular security audits
   - Monitor for constraint violations
   - Update policies as business rules evolve

## Troubleshooting

### Common RLS Issues
- **Permission Denied**: Check if user is authenticated
- **Policy Violation**: Verify RLS policies match business logic
- **Service Role Issues**: Ensure API endpoints use service role key

### Constraint Violations
- **Boat Length**: Ensure boat length ≤ 26 feet
- **Date Validation**: Check that check-out > check-in
- **Overlap Prevention**: Verify no conflicting bookings exist

### Authentication Issues
- **Email Verification**: Ensure user has verified email
- **Session Expiry**: Handle token refresh properly
- **User Profile**: Verify user profile exists in users table

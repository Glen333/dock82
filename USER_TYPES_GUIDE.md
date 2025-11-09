# 🎭 User Types Guide - Dock82 Platform

## Overview
The Dock82 platform supports 4 different user types, each with different permissions and capabilities.

---

## 1. 🛥️ **Renter** (Default)
**Default user type for new registrations**

### Capabilities:
- ✅ Browse and view available dock slips
- ✅ Book dock slips (with payment required)
- ✅ View their own bookings
- ✅ Cancel their own bookings (with refund policy)
- ✅ Upload rental agreements and insurance proof
- ✅ Receive booking confirmations and receipts
- ✅ Get discounts for 30-day bookings (40% off)

### Restrictions:
- ❌ Cannot book for more than 30 days without special approval
- ❌ Must pay for all bookings
- ❌ Cannot manage other users' bookings
- ❌ Cannot view or manage slips
- ❌ Cannot access admin features

### Use Case:
Regular customers who want to rent a dock slip for their boat.

---

## 2. 🏠 **Homeowner**
**For property owners who own dock slips**

### Capabilities:
- ✅ Browse and view available dock slips
- ✅ Book dock slips **FREE of charge** (no payment required)
- ✅ Priority booking (can bump renters if needed)
- ✅ View their own bookings
- ✅ Cancel their own bookings anytime
- ✅ Instant confirmation (no pending status)
- ✅ Receive booking confirmations and dock permits

### Restrictions:
- ❌ **Cannot add or create dock slips** - Only admins can add new slips to the system
- ❌ Cannot manage other users' bookings
- ❌ Cannot view or edit other users' bookings
- ❌ Cannot access admin features
- ❌ Cannot edit slip information

### Use Case:
Property owners who own dock slips and want to reserve them for their own use or guests.

---

## 3. 🔧 **Admin**
**Regular administrators with limited management access**

### Capabilities:
- ✅ **Add new dock slips** - Create new slips in the system
- ✅ View and edit all dock slips
- ✅ Update slip availability (activate/deactivate)
- ✅ **View ALL bookings** - See bookings from all users (renters and homeowners)
- ✅ **Approve pending bookings** - Approve renter bookings that need confirmation
- ✅ **Cancel any booking** - Cancel bookings from any user
- ✅ **Edit booking details** - Modify guest info, dates, etc. for any booking
- ✅ View analytics and reports
- ✅ All renter/homeowner capabilities (can also book slips for themselves)

### Restrictions:
- ❌ Cannot create or manage user accounts
- ❌ Cannot create or manage admin accounts
- ❌ Cannot access system settings
- ❌ Cannot change database configuration
- ❌ Cannot modify RLS policies

### Use Case:
Marina managers or staff who need to manage day-to-day operations but don't need full system access.

---

## 4. 👑 **Superadmin**
**Full system administrator with complete access**

### Capabilities:
- ✅ **Everything Admin can do** +
- ✅ Create, edit, and delete user accounts
- ✅ Create, edit, and delete admin accounts
- ✅ Manage user permissions
- ✅ Access system settings
- ✅ View all system analytics
- ✅ Modify database configuration
- ✅ Manage security policies
- ✅ Full control over the platform

### Restrictions:
- ❌ None (complete system access)

### Use Case:
Platform owner or system administrator who needs complete control over the entire platform.

---

## 🔐 Permission Matrix

| Feature | Renter | Homeowner | Admin | Superadmin |
|---------|--------|-----------|-------|------------|
| Browse Slips | ✅ | ✅ | ✅ | ✅ |
| Book Slips | ✅ (paid) | ✅ (free) | ✅ | ✅ |
| View Own Bookings | ✅ | ✅ | ✅ | ✅ |
| **View ALL Bookings** | ❌ | ❌ | ✅ | ✅ |
| **Approve Bookings** | ❌ | ❌ | ✅ | ✅ |
| **Cancel Any Booking** | ❌ | ❌ | ✅ | ✅ |
| **Edit Any Booking** | ❌ | ❌ | ✅ | ✅ |
| **Add New Slips** | ❌ | ❌ | ✅ | ✅ |
| **Edit Slips** | ❌ | ❌ | ✅ | ✅ |
| **Delete Slips** | ❌ | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Manage Admins | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

---

## 📋 Detailed Explanations

### 🔍 **What Does "Manage Bookings" Mean?**

**"Manage Bookings"** includes the following actions that only **Admins** and **Superadmins** can perform:

1. **View ALL Bookings** - See bookings from all users (not just their own)
2. **Approve Pending Bookings** - Renter bookings start as "pending" and need admin approval
3. **Cancel Any Booking** - Cancel bookings from any user (renters or homeowners)
4. **Edit Booking Details** - Modify guest information, dates, boat details, etc.
5. **View Booking History** - See all past and current bookings
6. **Manage Booking Status** - Change status from pending → confirmed → cancelled

**Regular Users (Renters/Homeowners):**
- Can only view and manage their **OWN** bookings
- Cannot see other users' bookings
- Cannot approve or cancel other users' bookings

---

### 🏗️ **Who Can Add Dock Slips?**

**Only Admins and Superadmins can add new dock slips to the system.**

- ✅ **Admins** - Can add, edit, and delete dock slips
- ✅ **Superadmins** - Can add, edit, and delete dock slips (full access)
- ❌ **Homeowners** - **CANNOT** add dock slips
- ❌ **Renters** - **CANNOT** add dock slips

**Why?**
- Dock slips are the inventory/equipment of the marina/platform
- Adding slips requires administrative access to the database
- Homeowners are customers who own property, but they don't manage the platform's slip inventory
- Slip management is a system administration task, not a customer task

**How to Add Slips:**
1. Login as Admin or Superadmin
2. Go to Admin Panel → Settings Tab
3. Click "Add Slips 13 & 14 to Database" (or use slip management tools)
4. New slips are added to the system and can be booked by users

---

## 📝 Quick Reference

### Login Credentials:
- **Superadmin:**
  - Email: `Glen@centriclearning.net`
  - Password: `Dock82Admin2024!`

- **Regular Admin:**
  - Email: `admin@dock82.com`
  - Password: `Dock82Admin2024!`

### Default User Type:
- New registrations default to **`renter`**
- Can be changed to **`homeowner`** during registration
- Admin and Superadmin must be created by existing Superadmin

---

## 🎯 Choosing the Right User Type

### When to use **Renter**:
- Customer wants to rent a dock slip
- Customer needs to pay for bookings
- Customer is not a property owner

### When to use **Homeowner**:
- User owns property/dock slip
- User should get free bookings
- User needs priority access

### When to use **Admin**:
- Staff member needs to manage bookings
- Staff member needs to manage slips
- Staff member doesn't need user management access

### When to use **Superadmin**:
- Platform owner
- System administrator
- Needs full system control

---

## 🔄 Changing User Types

### From Renter to Homeowner:
1. User can re-register with homeowner type
2. Or Superadmin can update user type in admin panel

### From Renter/Homeowner to Admin:
1. Superadmin must create admin account
2. Admin accounts have special permissions

### From Admin to Superadmin:
1. Superadmin must promote admin
2. Superadmin has additional permissions beyond admin

---

## 📧 Email Notifications

All user types receive:
- ✅ Welcome email upon registration
- ✅ Booking confirmation emails
- ✅ Dock permit emails
- ✅ Payment receipts (renters only)

---

**Need Help?** Contact the superadmin at `Glen@centriclearning.net`


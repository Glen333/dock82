import { sql } from '@vercel/postgres';

// Database initialization
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        user_type VARCHAR(50) DEFAULT 'renter',
        permissions JSONB DEFAULT '{}',
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create slips table
    await sql`
      CREATE TABLE IF NOT EXISTS slips (
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
    `;

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
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
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_slip_id ON bookings(slip_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);`;

    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Sample data insertion
export async function insertSampleData() {
  try {
    // Check if sample data already exists
    const existingSlips = await sql`SELECT COUNT(*) FROM slips`;
    if (existingSlips.rows[0].count > 0) {
      console.log('Sample data already exists');
      return true;
    }

    // Insert sample slips
    await sql`
      INSERT INTO slips (name, max_length, width, depth, price_per_night, amenities, description, dock_etiquette, available, images)
      VALUES 
        ('Dockmaster Slip', 26.0, 10.0, 6.0, 60.00, 
         '["Water", "Electric (120V)"]', 
         'Prime waterfront slip with easy access to main channel',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 2', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Convenient slip close to parking area',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         false,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 3', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Spacious slip with great views',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 4', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Premium slip with easy access',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 5', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Quiet slip perfect for relaxation',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 6', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Family-friendly slip with amenities',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 7', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Convenient slip near facilities',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 8', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Premium waterfront location',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 9', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Peaceful slip with great views',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 10', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Spacious slip for larger boats',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 11', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Convenient slip near parking',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
        ('Slip 12', 26.0, 10.0, 6.0, 60.00,
         '["Water", "Electric (120V)"]',
         'Premium slip with amenities',
         'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
         true,
         '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]')
    `;

    // Create superadmin user with proper error handling
    try {
      const superadminPasswordHash = await hashPassword('Dock82Admin2024!');
      await sql`
        INSERT INTO users (name, email, password_hash, user_type, phone, permissions)
        VALUES (
          'Super Admin', 
          'Glen@centriclearning.net', 
          ${superadminPasswordHash}, 
          'superadmin', 
          '555-0123',
          '{"manage_users": true, "manage_admins": true, "manage_slips": true, "manage_bookings": true, "view_analytics": true, "system_settings": true}'
        )
        ON CONFLICT (email) DO NOTHING
      `;
      console.log('Superadmin user created successfully');
    } catch (error) {
      console.log('Superadmin user already exists or error:', error.message);
    }
    
    // Create regular admin user with proper error handling
    try {
      const adminPasswordHash = await hashPassword('Dock82Admin2024!');
      await sql`
        INSERT INTO users (name, email, password_hash, user_type, phone, permissions)
        VALUES (
          'Regular Admin', 
          'admin@dock82.com', 
          ${adminPasswordHash}, 
          'admin', 
          '555-0124',
          '{"manage_slips": true, "manage_bookings": true, "view_analytics": true}'
        )
        ON CONFLICT (email) DO NOTHING
      `;
      console.log('Regular admin user created successfully');
    } catch (error) {
      console.log('Regular admin user already exists or error:', error.message);
    }

    console.log('Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return false;
  }
}

// User operations
export async function createUser(userData) {
  const { name, email, password, phone, userType } = userData;
  const passwordHash = await hashPassword(password);
  
  try {
    const result = await sql`
      INSERT INTO users (name, email, password_hash, phone, user_type)
      VALUES (${name}, ${email}, ${passwordHash}, ${phone}, ${userType})
      RETURNING id, name, email, phone, user_type, created_at
    `;
    return { success: true, user: result.rows[0] };
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return { success: false, error: 'User with this email already exists' };
    }
    return { success: false, error: error.message };
  }
}

export async function authenticateUser(email, password) {
  try {
    const passwordHash = await hashPassword(password);
    const result = await sql`
      SELECT id, name, email, phone, user_type, created_at
      FROM users 
      WHERE email = ${email} AND password_hash = ${passwordHash}
    `;
    
    if (result.rows.length > 0) {
      return { success: true, user: result.rows[0] };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, name, email, phone, user_type, permissions, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    return { success: true, users: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createAdmin(adminData, createdBySuperadmin = false) {
  const { name, email, password, phone, userType, permissions } = adminData;
  const passwordHash = await hashPassword(password);
  
  try {
    const result = await sql`
      INSERT INTO users (name, email, password_hash, phone, user_type, permissions)
      VALUES (${name}, ${email}, ${passwordHash}, ${phone}, ${userType}, ${JSON.stringify(permissions)})
      RETURNING id, name, email, phone, user_type, permissions, created_at
    `;
    return { success: true, user: result.rows[0] };
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return { success: false, error: 'User with this email already exists' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateUserPermissions(userId, permissions, updatedBySuperadmin = false) {
  try {
    const result = await sql`
      UPDATE users 
      SET permissions = ${JSON.stringify(permissions)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, name, email, user_type, permissions
    `;
    
    if (result.rows.length > 0) {
      return { success: true, user: result.rows[0] };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId, deletedBySuperadmin = false) {
  try {
    const result = await sql`
      DELETE FROM users 
      WHERE id = ${userId} AND user_type != 'superadmin'
      RETURNING id, name, email, user_type
    `;
    
    if (result.rows.length > 0) {
      return { success: true, user: result.rows[0] };
    } else {
      return { success: false, error: 'User not found or cannot delete superadmin' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAdmins() {
  try {
    const result = await sql`
      SELECT id, name, email, phone, user_type, permissions, created_at
      FROM users
      WHERE user_type IN ('admin', 'superadmin')
      ORDER BY user_type DESC, created_at ASC
    `;
    return { success: true, admins: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generatePasswordResetToken(email) {
  try {
    // Check if user exists
    const userResult = await sql`
      SELECT id, name, email FROM users WHERE email = ${email}
    `;
    
    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    // Generate reset token (simple implementation - in production use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token
    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expires = ${expiresAt}
      WHERE email = ${email}
    `;
    
    return { 
      success: true, 
      resetToken,
      user: userResult.rows[0]
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resetPasswordWithToken(resetToken, newPassword) {
  try {
    // Find user with valid reset token
    const userResult = await sql`
      SELECT id, email FROM users 
      WHERE reset_token = ${resetToken} 
      AND reset_token_expires > CURRENT_TIMESTAMP
    `;
    
    if (userResult.rows.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' };
    }
    
    const passwordHash = await hashPassword(newPassword);
    
    // Update password and clear reset token
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, 
          reset_token = NULL, 
          reset_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userResult.rows[0].id}
    `;
    
    return { 
      success: true, 
      user: userResult.rows[0]
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  try {
    // Get current user
    const userResult = await sql`
      SELECT password_hash FROM users WHERE id = ${userId}
    `;
    
    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    // Verify current password
    const currentPasswordHash = await hashPassword(currentPassword);
    if (userResult.rows[0].password_hash !== currentPasswordHash) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    await sql`
      UPDATE users 
      SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(userId, userData) {
  try {
    const { name, phone, userType } = userData;
    
    const result = await sql`
      UPDATE users 
      SET name = ${name}, phone = ${phone}, user_type = ${userType}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, name, email, phone, user_type, permissions, created_at, updated_at
    `;
    
    if (result.rows.length > 0) {
      return { success: true, user: result.rows[0] };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateBooking(bookingId, bookingData) {
  try {
    const { guestName, guestEmail, guestPhone, checkIn, checkOut, boatLength, boatMakeModel, status } = bookingData;
    
    const result = await sql`
      UPDATE bookings 
      SET guest_name = ${guestName}, 
          guest_email = ${guestEmail}, 
          guest_phone = ${guestPhone}, 
          check_in = ${checkIn}, 
          check_out = ${checkOut}, 
          boat_length = ${boatLength}, 
          boat_make_model = ${boatMakeModel}, 
          status = ${status}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    if (result.rows.length > 0) {
      return { success: true, booking: result.rows[0] };
    } else {
      return { success: false, error: 'Booking not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateSlip(slipId, slipData) {
  try {
    const { name, description, pricePerNight, images, dock_etiquette } = slipData;
    
    const result = await sql`
      UPDATE slips 
      SET name = ${name}, 
          description = ${description}, 
          price_per_night = ${pricePerNight}, 
          images = ${JSON.stringify(images)}, 
          dock_etiquette = ${dock_etiquette || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${slipId}
      RETURNING *
    `;
    
    if (result.rows.length > 0) {
      return { success: true, slip: result.rows[0] };
    } else {
      return { success: false, error: 'Slip not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Slip operations
export async function getAllSlips() {
  try {
    const result = await sql`
      SELECT id, name, max_length, width, depth, price_per_night, 
             amenities, description, dock_etiquette, available, images
      FROM slips
      ORDER BY name
    `;
    return { success: true, slips: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateSlipImages(imageUrl) {
  try {
    const result = await sql`
      UPDATE slips 
      SET images = ${JSON.stringify([imageUrl])}, updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, images
    `;
    return { success: true, updatedSlips: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Booking operations
export async function createBooking(bookingData) {
  try {
    const result = await sql`
      INSERT INTO bookings (
        slip_id, user_id, guest_name, guest_email, guest_phone,
        check_in, check_out, boat_length, boat_make_model, user_type,
        nights, total_cost, status, payment_status, payment_method,
        rental_agreement_name, insurance_proof_name, rental_property,
        rental_start_date, rental_end_date
      )
      VALUES (
        ${bookingData.slipId}, ${bookingData.userId || 1}, ${bookingData.guestName},
        ${bookingData.guestEmail}, ${bookingData.guestPhone}, ${bookingData.checkIn},
        ${bookingData.checkOut}, ${bookingData.boatLength}, ${bookingData.boatMakeModel},
        ${bookingData.userType || 'renter'}, ${bookingData.nights}, ${bookingData.totalCost},
        ${bookingData.status || 'pending'}, ${bookingData.paymentStatus || 'pending'},
        ${bookingData.paymentMethod || 'stripe'}, ${bookingData.rentalAgreementName},
        ${bookingData.insuranceProofName}, ${bookingData.rentalProperty},
        ${bookingData.rentalStartDate}, ${bookingData.rentalEndDate}
      )
      RETURNING *
    `;
    return { success: true, booking: result.rows[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllBookings() {
  try {
    const result = await sql`
      SELECT b.*, s.name as slip_name, u.name as user_name
      FROM bookings b
      LEFT JOIN slips s ON b.slip_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `;
    return { success: true, bookings: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserBookings(userId) {
  try {
    const result = await sql`
      SELECT b.*, s.name as slip_name
      FROM bookings b
      LEFT JOIN slips s ON b.slip_id = s.id
      WHERE b.user_id = ${userId}
      ORDER BY b.created_at DESC
    `;
    return { success: true, bookings: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Utility function for password hashing
async function hashPassword(password) {
  // In production, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Delete user and all their bookings
export async function deleteUser(userEmail, isSuperAdmin = false) {
  try {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only superadmins can delete users' };
    }

    // First delete all bookings for this user
    const deleteBookings = await sql`
      DELETE FROM bookings 
      WHERE guest_email = ${userEmail}
    `;

    // Then delete the user
    const deleteUser = await sql`
      DELETE FROM users 
      WHERE email = ${userEmail}
      RETURNING id, email, name
    `;

    if (deleteUser.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    return { 
      success: true, 
      user: deleteUser.rows[0],
      deletedBookings: deleteBookings.rowCount
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

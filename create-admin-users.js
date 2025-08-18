import { sql } from '@vercel/postgres';

// Utility function for password hashing
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createAdminUsers() {
  try {
    console.log('🔧 Creating admin users...');
    
    // Create superadmin user
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
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        user_type = EXCLUDED.user_type,
        permissions = EXCLUDED.permissions
    `;
    console.log('✅ Superadmin user created/updated successfully');
    
    // Create regular admin user
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
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        user_type = EXCLUDED.user_type,
        permissions = EXCLUDED.permissions
    `;
    console.log('✅ Regular admin user created/updated successfully');
    
    // Verify users were created
    const users = await sql`
      SELECT id, name, email, user_type, created_at
      FROM users 
      WHERE email IN ('Glen@centriclearning.net', 'admin@dock82.com')
      ORDER BY user_type DESC
    `;
    
    console.log('\n📋 Created Users:');
    users.rows.forEach(user => {
      console.log(`   ${user.user_type}: ${user.email} (ID: ${user.id})`);
    });
    
    console.log('\n🎉 Admin users created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Superadmin: Glen@centriclearning.net / Dock82Admin2024!');
    console.log('   Admin: admin@dock82.com / Dock82Admin2024!');
    
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  }
}

// Run the function
createAdminUsers();

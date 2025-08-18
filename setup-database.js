// Simple script to trigger database setup
const API_URL = 'https://dock-rental-vercel-11nr43ku2-glen-taylors-projects.vercel.app';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database and creating admin users...');
    console.log(`🌐 API URL: ${API_URL}/api/setup-database`);
    
    const response = await fetch(`${API_URL}/api/setup-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Database setup successful!');
      console.log('📋 Result:', JSON.stringify(result, null, 2));
      
      if (result.credentials) {
        console.log('\n🔑 **ADMIN CREDENTIALS CREATED:**');
        console.log('👑 Superadmin:');
        console.log(`   Email: ${result.credentials.superadmin.email}`);
        console.log(`   Password: ${result.credentials.superadmin.password}`);
        console.log('\n🔧 Regular Admin:');
        console.log(`   Email: ${result.credentials.admin.email}`);
        console.log(`   Password: ${result.credentials.admin.password}`);
        console.log('\n🎉 You can now login to your dock rental platform!');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Database setup failed');
      console.log('Status:', response.status);
      console.log('Response:', errorText);
    }
  } catch (error) {
    console.log('❌ Error setting up database:', error.message);
    console.log('\n💡 **Alternative Solution:**');
    console.log('1. Open your app in the browser:');
    console.log(`   ${API_URL}`);
    console.log('2. The database will initialize automatically');
    console.log('3. Admin users will be created on first visit');
  }
}

// Run the setup
setupDatabase();

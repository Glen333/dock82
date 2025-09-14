import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { action } = req.query;

      if (action === 'users') {
        // Get all users from Supabase
        try {
          const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase error getting users:', error);
            return res.status(500).json({ error: 'Failed to get users: ' + error.message });
          }

          res.status(200).json({ users: users || [] });
        } catch (error) {
          console.error('Error getting users:', error);
          res.status(500).json({ error: 'Failed to get users: ' + error.message });
        }
      } else if (action === 'admins') {
        // Get all admins from Supabase
        try {
          const { data: admins, error } = await supabase
            .from('users')
            .select('*')
            .in('user_type', ['admin', 'superadmin'])
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase error getting admins:', error);
            return res.status(500).json({ error: 'Failed to get admins: ' + error.message });
          }

          res.status(200).json({ admins: admins || [] });
        } catch (error) {
          console.error('Error getting admins:', error);
          res.status(500).json({ error: 'Failed to get admins: ' + error.message });
        }
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } else if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'create-admin') {
        // Create new admin using Supabase
        try {
          const { name, email, password, phone } = data;
          
          if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
          }

          // Hash password (simple hash for demo - in production use bcrypt)
          const passwordHash = Buffer.from(password).toString('base64');

          const { data: newAdmin, error } = await supabase
            .from('users')
            .insert([{
              name: name,
              email: email,
              password_hash: passwordHash,
              phone: phone || '',
              user_type: 'admin',
              permissions: JSON.stringify({
                manage_users: true,
                manage_slips: true,
                manage_bookings: true,
                view_analytics: true
              })
            }])
            .select()
            .single();

          if (error) {
            console.error('Supabase error creating admin:', error);
            return res.status(500).json({ error: 'Failed to create admin: ' + error.message });
          }

          res.status(201).json({ 
            success: true, 
            message: 'Admin created successfully',
            admin: newAdmin 
          });
        } catch (error) {
          console.error('Error creating admin:', error);
          res.status(500).json({ error: 'Failed to create admin: ' + error.message });
        }
      } else if (action === 'update-permissions') {
        // Update user permissions using Supabase
        try {
          const { userId, permissions } = data;
          
          if (!userId || !permissions) {
            return res.status(400).json({ error: 'User ID and permissions are required' });
          }

          const { error } = await supabase
            .from('users')
            .update({ 
              permissions: JSON.stringify(permissions),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Supabase error updating permissions:', error);
            return res.status(500).json({ error: 'Failed to update permissions: ' + error.message });
          }

          res.status(200).json({ 
            success: true, 
            message: 'Permissions updated successfully' 
          });
        } catch (error) {
          console.error('Error updating permissions:', error);
          res.status(500).json({ error: 'Failed to update permissions: ' + error.message });
        }
      } else if (action === 'delete-user') {
        // Delete user using Supabase
        try {
          const { userEmail } = data;
          
          if (!userEmail) {
            return res.status(400).json({ error: 'User email is required' });
          }

          const { error } = await supabase
            .from('users')
            .delete()
            .eq('email', userEmail);

          if (error) {
            console.error('Supabase error deleting user:', error);
            return res.status(500).json({ error: 'Failed to delete user: ' + error.message });
          }

          res.status(200).json({ 
            success: true, 
            message: 'User deleted successfully' 
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          res.status(500).json({ error: 'Failed to delete user: ' + error.message });
        }
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

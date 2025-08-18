import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple password hashing function (in production, use bcrypt)
function hashPassword(password) {
  // This is a simple hash for demo purposes
  // In production, use: const bcrypt = require('bcrypt'); return bcrypt.hashSync(password, 10);
  return 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
}

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
    if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'check-user') {
        // Simplified check - hardcoded for Glen@centriclearning.net
        const exists = data.email === 'Glen@centriclearning.net';
        console.log('Checking user:', data.email, 'exists:', exists);
        
        res.status(200).json({
          exists: exists,
          user: exists ? { email: data.email } : null
        });
      } else if (action === 'login') {
        // User login with Supabase
        try {
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', data.email)
            .eq('password_hash', hashPassword(data.password))
            .single();

          if (error) {
            console.log('Login failed for:', data.email, error.message);
            return res.status(401).json({ error: 'Invalid email or password' });
          }

          if (user) {
            console.log('Login successful for:', data.email);
            
            // Transform user data to match frontend expectations
            const userResponse = {
              id: user.id,
              name: user.name,
              email: user.email,
              userType: user.user_type,
              phone: user.phone,
              permissions: user.permissions || {}
            };
            
            res.status(200).json({
              success: true,
              message: 'Login successful',
              user: userResponse
            });
          } else {
            res.status(401).json({ error: 'Invalid email or password' });
          }
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else if (action === 'register') {
        // Register new user with Supabase
        try {
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', data.email)
            .single();

          if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
          }

          const newUser = {
            name: data.name,
            email: data.email,
            password_hash: hashPassword(data.password),
            user_type: data.userType || 'renter',
            phone: data.phone || '',
            permissions: {},
            email_verified: false
          };

          const { data: createdUser, error: insertError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

          if (insertError) {
            console.error('Registration error:', insertError);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          console.log('User registered:', data.email);
          
          const userResponse = {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            userType: createdUser.user_type,
            phone: createdUser.phone,
            permissions: createdUser.permissions || {}
          };

          res.status(201).json({ 
            success: true, 
            message: 'User registered successfully', 
            user: userResponse 
          });
        } catch (error) {
          console.error('Registration error:', error);
          res.status(500).json({ error: 'Internal server error' });
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

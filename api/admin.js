import { 
  getAllUsers, 
  createAdmin, 
  updateUserPermissions, 
  deleteUser, 
  getAdmins 
} from './db.js';

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
        // Get all users
        try {
          const result = await getAllUsers();
          if (result.success) {
            res.status(200).json({ users: result.users });
          } else {
            res.status(500).json({ error: result.error });
          }
        } catch (error) {
          console.error('Error getting users:', error);
          res.status(500).json({ error: 'Failed to get users: ' + error.message });
        }
      } else if (action === 'admins') {
        // Get all admins
        try {
          const result = await getAdmins();
          if (result.success) {
            res.status(200).json({ admins: result.admins });
          } else {
            res.status(500).json({ error: result.error });
          }
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
        // Create new admin (superadmin only)
        const result = await createAdmin(data, true);
        if (result.success) {
          res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            user: result.user
          });
        } else {
          res.status(400).json({ error: result.error });
        }
      } else if (action === 'update-permissions') {
        // Update user permissions (superadmin only)
        const { userId, permissions } = data;
        const result = await updateUserPermissions(userId, permissions, true);
        if (result.success) {
          res.status(200).json({
            success: true,
            message: 'Permissions updated successfully',
            user: result.user
          });
        } else {
          res.status(400).json({ error: result.error });
        }
      } else if (action === 'delete-user') {
        // Delete user (superadmin only)
        const { userEmail } = data;
        const result = await deleteUser(userEmail, true);
        if (result.success) {
          res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            user: result.user,
            deletedBookings: result.deletedBookings
          });
        } else {
          res.status(400).json({ error: result.error });
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

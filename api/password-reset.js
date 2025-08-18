import { 
  generatePasswordResetToken, 
  resetPasswordWithToken, 
  changePassword 
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
    if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'forgot-password') {
        // Generate password reset token
        const { email } = data;
        const result = await generatePasswordResetToken(email);
        
        if (result.success) {
          // In a real app, you would send this token via email
          // For now, we'll return it directly (for testing purposes)
          res.status(200).json({
            success: true,
            message: 'Password reset token generated successfully',
            resetToken: result.resetToken, // Remove this in production
            user: result.user
          });
        } else {
          res.status(400).json({ error: result.error });
        }
      } else if (action === 'reset-password') {
        // Reset password with token
        const { resetToken, newPassword } = data;
        const result = await resetPasswordWithToken(resetToken, newPassword);
        
        if (result.success) {
          res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            user: result.user
          });
        } else {
          res.status(400).json({ error: result.error });
        }
      } else if (action === 'change-password') {
        // Change password (requires current password)
        const { userId, currentPassword, newPassword } = data;
        const result = await changePassword(userId, currentPassword, newPassword);
        
        if (result.success) {
          res.status(200).json({
            success: true,
            message: 'Password changed successfully'
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
    console.error('Password Reset API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

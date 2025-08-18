export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { action, email } = req.body;
    
    console.log('Test login flow - Action:', action, 'Email:', email);
    
    if (action === 'check-user') {
      // Simulate the check-user response
      const exists = email === 'Glen@centriclearning.net';
      
      console.log('User exists:', exists);
      
      return res.status(200).json({
        exists: exists,
        user: exists ? { email: email } : null,
        debug: {
          action: action,
          email: email,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
  
  res.status(200).json({ message: 'Test endpoint working' });
}

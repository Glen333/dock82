export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('DEBUG LOGIN - Method:', req.method);
  console.log('DEBUG LOGIN - Headers:', req.headers);
  console.log('DEBUG LOGIN - Body:', req.body);

  if (req.method === 'POST') {
    const { action, email } = req.body;
    
    console.log('DEBUG LOGIN - Action:', action, 'Email:', email);
    
    // Always return exists: true for Glen@centriclearning.net
    const exists = email === 'Glen@centriclearning.net';
    
    const response = {
      exists: exists,
      user: exists ? { email: email } : null,
      debug: {
        action: action,
        email: email,
        timestamp: new Date().toISOString(),
        message: 'Debug endpoint called successfully',
        exists: exists
      }
    };
    
    console.log('DEBUG LOGIN - Response:', response);
    
    return res.status(200).json(response);
  }
  
  res.status(200).json({ message: 'Debug endpoint working', method: req.method });
}




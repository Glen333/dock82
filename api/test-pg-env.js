export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const envCheck = {
      POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Missing',
      POSTGRES_USER: process.env.POSTGRES_USER ? 'Set' : 'Missing',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? 'Set' : 'Missing',
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? 'Set' : 'Missing',
      POSTGRES_HOST: process.env.POSTGRES_HOST ? 'Set' : 'Missing',
      POSTGRES_URL_LENGTH: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0,
      POSTGRES_URL_START: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 30) + '...' : 'N/A'
    };

    res.status(200).json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Environment check failed',
      details: error.message
    });
  }
}


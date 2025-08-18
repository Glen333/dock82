import { sql } from '@vercel/postgres';

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
    console.log('Testing Vercel Postgres connection...');
    
    // Simple query to test connection
    const result = await sql`SELECT 1 as test, NOW() as current_time`;
    
    console.log('Database connection successful:', result.rows);
    
    res.status(200).json({
      success: true,
      message: 'Vercel Postgres connection successful',
      result: result.rows[0]
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      stack: error.stack
    });
  }
}

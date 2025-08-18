import { initDatabase, insertSampleData } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'init-database') {
        // Initialize database tables
        const dbResult = await initDatabase();
        if (dbResult) {
          // Insert sample data
          const sampleResult = await insertSampleData();
          if (sampleResult) {
            res.status(200).json({
              success: true,
              message: 'Database initialized successfully with sample data'
            });
          } else {
            res.status(500).json({
              success: false,
              error: 'Failed to insert sample data'
            });
          }
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to initialize database'
          });
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

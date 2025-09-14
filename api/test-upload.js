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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action } = req.body;

    if (action === 'test-connection') {
      // Test database connection
      const result = await sql`SELECT COUNT(*) as count FROM slips`;
      
      return res.status(200).json({
        success: true,
        message: 'Database connection successful',
        slipCount: result.rows[0].count
      });
    }

    if (action === 'test-upload') {
      const { slipId, imageData } = req.body;
      
      if (!slipId || !imageData) {
        return res.status(400).json({ error: 'Missing slipId or imageData' });
      }

      // Test the upload process
      const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const result = await sql`
        UPDATE slips 
        SET images = ${JSON.stringify([testImageData])}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${slipId}
        RETURNING id, name, images, updated_at
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Slip not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Test upload successful',
        slip: result.rows[0]
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Test upload error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      stack: error.stack
    });
  }
}




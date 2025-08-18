import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action } = req.body;

    if (action === 'create-bucket') {
      console.log('Creating storage bucket...');
      
      // Create the storage bucket using SQL
      const { data: bucketData, error: bucketError } = await supabase
        .rpc('create_storage_bucket', {
          bucket_name: 'slip-images',
          bucket_id: 'slip-images',
          public_bucket: true,
          file_size_limit: 5242880, // 5MB
          allowed_mime_types: ['image/jpeg', 'image/jpg']
        });

      if (bucketError) {
        console.error('Bucket creation error:', bucketError);
        
        // Try alternative method using direct SQL
        const { data: sqlData, error: sqlError } = await supabase
          .from('storage.buckets')
          .insert({
            id: 'slip-images',
            name: 'slip-images',
            public: true,
            file_size_limit: 5242880,
            allowed_mime_types: ['image/jpeg', 'image/jpg']
          })
          .select();

        if (sqlError) {
          console.error('SQL bucket creation error:', sqlError);
          return res.status(500).json({ 
            error: 'Failed to create storage bucket',
            details: sqlError.message 
          });
        }

        console.log('Bucket created via SQL:', sqlData);
      } else {
        console.log('Bucket created via RPC:', bucketData);
      }

      // Set up RLS policies
      const policies = [
        {
          name: 'Public read access for slip images',
          definition: "CREATE POLICY \"Public read access for slip images\" ON storage.objects FOR SELECT USING (bucket_id = 'slip-images')"
        },
        {
          name: 'Authenticated users can upload slip images',
          definition: "CREATE POLICY \"Authenticated users can upload slip images\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'slip-images' AND auth.role() = 'authenticated')"
        },
        {
          name: 'Authenticated users can update slip images',
          definition: "CREATE POLICY \"Authenticated users can update slip images\" ON storage.objects FOR UPDATE USING (bucket_id = 'slip-images' AND auth.role() = 'authenticated')"
        },
        {
          name: 'Authenticated users can delete slip images',
          definition: "CREATE POLICY \"Authenticated users can delete slip images\" ON storage.objects FOR DELETE USING (bucket_id = 'slip-images' AND auth.role() = 'authenticated')"
        }
      ];

      for (const policy of policies) {
        try {
          await supabase.rpc('exec_sql', { sql: policy.definition });
          console.log(`Policy created: ${policy.name}`);
        } catch (error) {
          console.log(`Policy ${policy.name} already exists or failed:`, error.message);
        }
      }

      // Verify bucket exists
      const { data: buckets, error: listError } = await supabase
        .storage
        .listBuckets();

      if (listError) {
        console.error('Error listing buckets:', listError);
      } else {
        console.log('Available buckets:', buckets);
      }

      return res.status(200).json({
        success: true,
        message: 'Storage bucket created successfully',
        bucket: 'slip-images',
        policies: policies.map(p => p.name)
      });

    } else if (action === 'check-bucket') {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase
        .storage
        .listBuckets();

      if (listError) {
        return res.status(500).json({ 
          error: 'Failed to list buckets',
          details: listError.message 
        });
      }

      const slipImagesBucket = buckets.find(bucket => bucket.id === 'slip-images');
      
      return res.status(200).json({
        success: true,
        bucketExists: !!slipImagesBucket,
        bucket: slipImagesBucket,
        allBuckets: buckets
      });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Setup storage error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

import { createClient } from '@supabase/supabase-js';

// Use React environment variables with fallbacks
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://phstdzlniugqbxtfgktb.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.3mnXT9TS0nV1uJT1SpFglwF6_9KH_T9WOa4VsHumdw4';

// Debug logging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Validate URL before creating client
if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error('Supabase URL is invalid');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.error('Invalid Supabase Key:', supabaseAnonKey);
  throw new Error('Supabase Key is invalid');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

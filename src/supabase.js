import { createClient } from '@supabase/supabase-js';

// Use React environment variables with fallbacks
const envUrl = process.env.REACT_APP_SUPABASE_URL;
const envKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug logging
console.log('Environment URL:', envUrl);
console.log('Environment Key:', envKey ? 'Present' : 'Missing');
console.log('Environment Key value:', envKey);
console.log('process.env object:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));

// Use fallback values if environment variables are undefined or invalid
const supabaseUrl = (envUrl && envUrl !== 'undefined' && envUrl.trim() !== '') 
  ? envUrl 
  : 'https://phstdzlniugqbxtfgktb.supabase.co';

const supabaseAnonKey = (envKey && envKey !== 'undefined' && envKey.trim() !== '') 
  ? envKey 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.u5A8Loh-pk9FCU68Rs1SWE8qBkxx5LXMhK-eM_EtNwM';

console.log('Final Supabase URL:', supabaseUrl);
console.log('Final Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Supabase Key (first 20 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Missing');

// Validate URL before creating client
if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error('Supabase URL is invalid: ' + supabaseUrl);
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined' || supabaseAnonKey.trim() === '') {
  console.error('Invalid Supabase Key:', supabaseAnonKey);
  throw new Error('Supabase Key is invalid');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

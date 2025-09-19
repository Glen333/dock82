import { createClient } from '@supabase/supabase-js';

// Use React environment variables (VITE_ variables will be handled by build process)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://phstdzlniugqbxtfgktb.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.3mnXT9TS0nV1uJT1SpFglwF6_9KH_T9WOa4VsHumdw4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

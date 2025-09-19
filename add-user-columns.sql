-- Add missing columns to users table for registration data
-- Run this in your Supabase SQL Editor

-- Add property_address column for homeowners
ALTER TABLE users ADD COLUMN IF NOT EXISTS property_address TEXT;

-- Add emergency_contact column for homeowners  
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Add email_verified column to track email verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Update the updated_at column when any of these new columns are modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

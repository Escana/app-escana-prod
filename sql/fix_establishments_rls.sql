-- Check if establishments table exists and create it if not
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS establishments_name_idx ON establishments(name);

-- Enable Row Level Security
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Establishments are viewable by everyone" ON establishments;
DROP POLICY IF EXISTS "Establishments are insertable by superadmins" ON establishments;
DROP POLICY IF EXISTS "Establishments are updatable by superadmins" ON establishments;
DROP POLICY IF EXISTS "Establishments are deletable by superadmins" ON establishments;

-- Create policies
-- Everyone can view active establishments
CREATE POLICY "Establishments are viewable by everyone" 
ON establishments FOR SELECT 
USING (active = true);

-- Only superadmins can insert establishments
CREATE POLICY "Establishments are insertable by superadmins" 
ON establishments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'SUPERADMIN'
  )
);

-- Only superadmins can update establishments
CREATE POLICY "Establishments are updatable by superadmins" 
ON establishments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'SUPERADMIN'
  )
);

-- Only superadmins can delete establishments
CREATE POLICY "Establishments are deletable by superadmins" 
ON establishments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'SUPERADMIN'
  )
);

-- Create a special bypass policy for the BYPASS_AUTH environment variable
CREATE POLICY "Bypass auth for establishments" 
ON establishments 
USING (current_setting('app.bypass_auth', true)::text = 'true')
WITH CHECK (current_setting('app.bypass_auth', true)::text = 'true');


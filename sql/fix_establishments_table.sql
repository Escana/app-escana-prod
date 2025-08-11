-- Check if establishments table exists and create it if not
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  active BOOLEAN DEFAULT TRUE
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS establishments_name_idx ON establishments(name);

-- Enable Row Level Security
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Create policies for establishments
-- Policy for superadmins to do everything
DROP POLICY IF EXISTS establishments_superadmin_policy ON establishments;
CREATE POLICY establishments_superadmin_policy ON establishments
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'SUPERADMIN'
    )
  );

-- Policy for admins to view all establishments
DROP POLICY IF EXISTS establishments_admin_select_policy ON establishments;
CREATE POLICY establishments_admin_select_policy ON establishments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Policy for users to view only their establishment
DROP POLICY IF EXISTS establishments_user_select_policy ON establishments;
CREATE POLICY establishments_user_select_policy ON establishments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_establishments 
      WHERE user_id = auth.uid() 
      AND establishment_id = establishments.id
    )
  );

-- Make sure we have the user_establishments table for mapping users to establishments
CREATE TABLE IF NOT EXISTS user_establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  establishment_id UUID REFERENCES establishments(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, establishment_id)
);

-- Enable RLS on user_establishments
ALTER TABLE user_establishments ENABLE ROW LEVEL SECURITY;

-- Policy for superadmins to do everything with user_establishments
DROP POLICY IF EXISTS user_establishments_superadmin_policy ON user_establishments;
CREATE POLICY user_establishments_superadmin_policy ON user_establishments
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'SUPERADMIN'
    )
  );


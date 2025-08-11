-- Create establishments table if it doesn't exist
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id),
  max_capacity INTEGER,
  license_number TEXT,
  license_expiry DATE,
  opening_hours TEXT,
  closing_hours TEXT
);

-- Add comment to the table
COMMENT ON TABLE establishments IS 'Stores information about establishments registered in the platform';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_establishments_updated_at ON establishments;
CREATE TRIGGER update_establishments_updated_at
BEFORE UPDATE ON establishments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to count employees per establishment
CREATE OR REPLACE FUNCTION count_employees_per_establishment(establishment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  employee_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO employee_count
  FROM employees
  WHERE establishment_id = $1;
  
  RETURN employee_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Create policies for different roles
-- Superadmin can do everything
CREATE POLICY superadmin_all_establishments ON establishments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- Admin can read all establishments but only update their own
CREATE POLICY admin_read_establishments ON establishments
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_update_own_establishment ON establishments
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    owner_id = auth.uid()
  );

-- Guardia can only read their assigned establishment
CREATE POLICY guardia_read_own_establishment ON establishments
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'guardia' AND
    id = (SELECT establishment_id FROM employees WHERE id = auth.uid())
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS establishments_owner_id_idx ON establishments(owner_id);
CREATE INDEX IF NOT EXISTS establishments_status_idx ON establishments(status);


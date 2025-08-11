-- First, add missing column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS document_image TEXT;

-- Recreate stats table with correct structure
DROP TABLE IF EXISTS stats CASCADE;
CREATE TABLE stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visits INTEGER DEFAULT 0,
  total_incidents INTEGER DEFAULT 0,
  male_visits INTEGER DEFAULT 0,
  female_visits INTEGER DEFAULT 0,
  created_by UUID REFERENCES employees(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on date for faster lookups
CREATE INDEX IF NOT EXISTS idx_stats_date ON stats(date);

-- Update create_visit function to handle null results properly
CREATE OR REPLACE FUNCTION create_visit(
  p_client_id UUID,
  p_entry_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visit_id UUID;
BEGIN
  -- Insert the visit
  INSERT INTO visits (
    client_id,
    entry_time,
    created_at,
    updated_at
  ) VALUES (
    p_client_id,
    p_entry_time,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_visit_id;

  -- Update stats
  INSERT INTO stats (
    date,
    total_visits,
    male_visits,
    female_visits,
    created_by
  )
  VALUES (
    CURRENT_DATE,
    1,
    CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
    CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END,
    '00000000-0000-0000-0000-000000000000'
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_visits = stats.total_visits + 1,
    male_visits = stats.male_visits + 
      CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
    female_visits = stats.female_visits + 
      CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END;

  RETURN v_visit_id;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON stats TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stats_id_seq TO authenticated;


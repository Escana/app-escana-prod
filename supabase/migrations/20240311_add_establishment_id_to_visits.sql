-- Add establishment_id column to visits table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'visits' 
        AND column_name = 'establishment_id'
    ) THEN
        ALTER TABLE visits ADD COLUMN establishment_id UUID REFERENCES establishments(id);
    END IF;
END $$;

-- Update the create_visit function to handle the case where the column might not exist yet
DROP FUNCTION IF EXISTS create_visit(uuid, timestamptz);
DROP FUNCTION IF EXISTS create_visit(uuid, timestamptz, uuid);

-- Create a simplified version of the function that doesn't use establishment_id
CREATE OR REPLACE FUNCTION create_visit(
  p_client_id UUID,
  p_entry_time TIMESTAMPTZ,
  p_establishment_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_visit_id UUID;
  v_has_establishment_column BOOLEAN;
BEGIN
  -- Check if the establishment_id column exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'visits' 
    AND column_name = 'establishment_id'
  ) INTO v_has_establishment_column;

  -- Insert the visit with or without establishment_id based on column existence
  IF v_has_establishment_column AND p_establishment_id IS NOT NULL THEN
    INSERT INTO visits (
      client_id,
      entry_time,
      status,
      establishment_id
    ) VALUES (
      p_client_id,
      p_entry_time,
      'ACTIVE',
      p_establishment_id
    ) RETURNING id INTO v_visit_id;
  ELSE
    INSERT INTO visits (
      client_id,
      entry_time,
      status
    ) VALUES (
      p_client_id,
      p_entry_time,
      'ACTIVE'
    ) RETURNING id INTO v_visit_id;
  END IF;

  RETURN v_visit_id;
END;
$$ LANGUAGE plpgsql;


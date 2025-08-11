-- Update the create_visit function to include establishment_id
CREATE OR REPLACE FUNCTION create_visit(
  p_client_id UUID,
  p_entry_time TIMESTAMPTZ,
  p_establishment_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_visit_id UUID;
BEGIN
  -- Insert the visit
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

  -- Update the client's establishment_id if provided and not already set
  IF p_establishment_id IS NOT NULL THEN
    UPDATE clients
    SET establishment_id = p_establishment_id
    WHERE id = p_client_id AND (establishment_id IS NULL OR establishment_id != p_establishment_id);
  END IF;

  RETURN v_visit_id;
END;
$$ LANGUAGE plpgsql;


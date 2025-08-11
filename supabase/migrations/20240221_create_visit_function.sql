-- Create a function to insert visits that bypasses RLS
CREATE OR REPLACE FUNCTION create_visit(p_client_id UUID, p_entry_time TIMESTAMP WITH TIME ZONE)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO visits (client_id, entry_time)
  VALUES (p_client_id, p_entry_time);
END;
$$;


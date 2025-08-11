-- Create a function to handle visit creation with elevated privileges
CREATE OR REPLACE FUNCTION create_visit(
  p_client_id uuid,
  p_entry_time timestamp with time zone
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO visits (client_id, entry_time)
  VALUES (p_client_id, p_entry_time);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_visit TO authenticated;


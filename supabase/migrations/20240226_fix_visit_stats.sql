-- Drop existing function
DROP FUNCTION IF EXISTS create_visit;

-- Recreate function with fixed stats handling
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
  v_client_gender TEXT;
BEGIN
  -- Get client's gender first
  SELECT sexo INTO v_client_gender
  FROM clients
  WHERE id = p_client_id;

  -- Insert the visit
  INSERT INTO visits (
    id,
    client_id,
    entry_time,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_client_id,
    p_entry_time,
    'ACTIVE',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_visit_id;

  -- Ensure stats exist for today and update them
  INSERT INTO stats (
    date,
    total_visits,
    male_visits,
    female_visits,
    created_at,
    updated_at
  )
  VALUES (
    CURRENT_DATE,
    1,
    CASE WHEN v_client_gender = 'M' THEN 1 ELSE 0 END,
    CASE WHEN v_client_gender = 'F' THEN 1 ELSE 0 END,
    NOW(),
    NOW()
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_visits = stats.total_visits + 1,
    male_visits = stats.male_visits + CASE WHEN v_client_gender = 'M' THEN 1 ELSE 0 END,
    female_visits = stats.female_visits + CASE WHEN v_client_gender = 'F' THEN 1 ELSE 0 END,
    updated_at = NOW();

  -- Log the update for debugging
  RAISE NOTICE 'Visit created for client %. Gender: %. Visit ID: %', p_client_id, v_client_gender, v_visit_id;

  RETURN v_visit_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_visit TO authenticated;

-- Add some logging triggers for debugging
CREATE OR REPLACE FUNCTION log_stats_changes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Stats updated - Date: %, Total: %, Male: %, Female: %',
    NEW.date, NEW.total_visits, NEW.male_visits, NEW.female_visits;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stats_logging_trigger ON stats;
CREATE TRIGGER stats_logging_trigger
  AFTER INSERT OR UPDATE ON stats
  FOR EACH ROW
  EXECUTE FUNCTION log_stats_changes();


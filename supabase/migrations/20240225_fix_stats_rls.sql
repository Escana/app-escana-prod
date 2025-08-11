-- Drop existing RLS policies for stats table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON stats;
DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON stats;

-- Create new RLS policies with proper permissions
CREATE POLICY "Enable read access for all users"
ON stats FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON stats FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON stats FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON stats TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stats_id_seq TO authenticated;

-- Create or replace function to ensure stats exist for today
CREATE OR REPLACE FUNCTION ensure_daily_stats()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  current_date date := CURRENT_DATE;
BEGIN
  -- Check if stats exist for today
  IF NOT EXISTS (SELECT 1 FROM stats WHERE date = current_date) THEN
    -- Insert new stats row for today
    INSERT INTO stats (
      date,
      total_visits,
      total_incidents,
      male_visits,
      female_visits
    ) VALUES (
      current_date,
      0,
      0,
      0,
      0
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create or replace trigger
DROP TRIGGER IF EXISTS ensure_daily_stats_trigger ON visits;
CREATE TRIGGER ensure_daily_stats_trigger
  BEFORE INSERT ON visits
  FOR EACH STATEMENT
  EXECUTE FUNCTION ensure_daily_stats();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION ensure_daily_stats TO authenticated;


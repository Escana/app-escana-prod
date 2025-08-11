-- Create or replace the function to ensure stats exist for today
CREATE OR REPLACE FUNCTION ensure_daily_stats()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to ensure stats exist when accessing visits
DROP TRIGGER IF EXISTS ensure_daily_stats_trigger ON visits;
CREATE TRIGGER ensure_daily_stats_trigger
  BEFORE INSERT ON visits
  FOR EACH STATEMENT
  EXECUTE FUNCTION ensure_daily_stats();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_daily_stats TO authenticated;


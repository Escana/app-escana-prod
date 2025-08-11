-- Drop existing RLS policies for visits table
DROP POLICY IF EXISTS "Enable read access for all users" ON visits;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON visits;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON visits;

-- Create new RLS policies with proper permissions
CREATE POLICY "Enable read access for all authenticated users"
ON visits FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for all authenticated users"
ON visits FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for all authenticated users"
ON visits FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled but with proper policies
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON visits TO authenticated;

-- Grant usage on visits id sequence
GRANT USAGE, SELECT ON SEQUENCE visits_id_seq TO authenticated;


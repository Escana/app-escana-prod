-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON visits;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON visits;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON visits;

-- Create more permissive policies for visits table
CREATE POLICY "Enable read access for all users" ON visits
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON visits
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON visits
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON visits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON visits TO anon;


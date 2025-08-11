-- Modify visits table to ensure all required fields
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS exit_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON visits;

-- Create new RLS policy
CREATE POLICY "Enable all operations for authenticated users"
ON visits FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;


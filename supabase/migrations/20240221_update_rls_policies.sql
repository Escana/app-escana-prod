-- Disable RLS for visits table temporarily for debugging
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on visits table
CREATE POLICY "Allow all operations on visits"
ON visits
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable RLS for visits table
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;


-- First, ensure we have a system employee
INSERT INTO employees (id, name, email, role, status)
VALUES 
('00000000-0000-0000-0000-000000000000', 'System', 'system@escana.app', 'Administrador', 'Activo')
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read stats" ON stats;
DROP POLICY IF EXISTS "Authenticated can insert stats" ON stats;
DROP POLICY IF EXISTS "Authenticated can update stats" ON stats;

-- Create more permissive policies
CREATE POLICY "Enable all operations on stats"
ON stats
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions
GRANT ALL ON stats TO authenticated;
GRANT ALL ON stats TO anon;


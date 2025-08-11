-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON establishments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON establishments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON establishments;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON establishments;

-- Enable RLS on establishments table if not already enabled
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT operations
CREATE POLICY "Enable read for authenticated users" ON establishments
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy for INSERT operations
CREATE POLICY "Enable insert for authenticated users" ON establishments
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy for UPDATE operations
-- Only allow updates to establishments created by the user or if user is admin
CREATE POLICY "Enable update for authenticated users" ON establishments
    FOR UPDATE
    USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM employees 
            WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Create policy for DELETE operations
-- Only allow deletion of establishments created by the user or if user is admin
CREATE POLICY "Enable delete for authenticated users" ON establishments
    FOR DELETE
    USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM employees 
            WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Show the current policies for verification
SELECT * FROM pg_policies WHERE tablename = 'establishments';


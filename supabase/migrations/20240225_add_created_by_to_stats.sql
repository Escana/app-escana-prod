-- First, ensure we have a system employee
INSERT INTO employees (id, name, email, role, status)
VALUES 
('00000000-0000-0000-0000-000000000000', 'System', 'system@escana.app', 'Administrador', 'Activo')
ON CONFLICT (id) DO NOTHING;

-- Add created_by column to stats table
ALTER TABLE stats 
ADD COLUMN created_by UUID REFERENCES employees(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- Update existing rows to use system employee
UPDATE stats 
SET created_by = '00000000-0000-0000-0000-000000000000'
WHERE created_by IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations" ON stats;

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

-- Recreate the create_visit function to include created_by
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
BEGIN
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

    -- Update stats
    INSERT INTO stats (
        date,
        total_visits,
        male_visits,
        female_visits,
        created_by
    )
    VALUES (
        CURRENT_DATE,
        1,
        CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
        CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END,
        '00000000-0000-0000-0000-000000000000'
    )
    ON CONFLICT (date) 
    DO UPDATE SET
        total_visits = stats.total_visits + 1,
        male_visits = stats.male_visits + 
            CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
        female_visits = stats.female_visits + 
            CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END;

    RETURN v_visit_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_visit TO authenticated;


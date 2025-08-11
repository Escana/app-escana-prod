-- First, let's fix the visits table
ALTER TABLE visits ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE visits ALTER COLUMN entry_time SET DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE visits ALTER COLUMN created_at SET DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE visits ALTER COLUMN updated_at SET DEFAULT TIMEZONE('utc'::text, NOW());

-- Add status column if it doesn't exist
ALTER TABLE visits ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'ACTIVE';

-- Now fix the stats table structure
ALTER TABLE stats ALTER COLUMN id SET DEFAULT nextval('stats_id_seq');
ALTER TABLE stats ALTER COLUMN total_visits SET DEFAULT 0;
ALTER TABLE stats ALTER COLUMN total_incidents SET DEFAULT 0;
ALTER TABLE stats ALTER COLUMN male_visits SET DEFAULT 0;
ALTER TABLE stats ALTER COLUMN female_visits SET DEFAULT 0;
ALTER TABLE stats ALTER COLUMN created_at SET DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE stats ALTER COLUMN updated_at SET DEFAULT TIMEZONE('utc'::text, NOW());

-- Ensure proper RLS policies for visits
DROP POLICY IF EXISTS "Enable all operations" ON visits;
CREATE POLICY "Enable all operations"
    ON visits
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Ensure proper RLS policies for stats
DROP POLICY IF EXISTS "Enable all operations" ON stats;
CREATE POLICY "Enable all operations"
    ON stats
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create or replace the visit creation function
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

    -- Ensure stats exist for today and update them
    INSERT INTO stats (
        date,
        total_visits,
        male_visits,
        female_visits
    )
    VALUES (
        CURRENT_DATE,
        1,
        CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
        CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END
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

-- Grant necessary permissions
GRANT ALL ON visits TO authenticated;
GRANT ALL ON stats TO authenticated;
GRANT EXECUTE ON FUNCTION create_visit TO authenticated;


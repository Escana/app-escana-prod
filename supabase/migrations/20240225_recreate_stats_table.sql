-- Drop existing stats table and related objects
DROP TABLE IF EXISTS stats CASCADE;

-- Recreate stats table with proper structure
CREATE TABLE stats (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_visits INTEGER DEFAULT 0,
    total_incidents INTEGER DEFAULT 0,
    male_visits INTEGER DEFAULT 0,
    female_visits INTEGER DEFAULT 0,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on date for faster lookups
CREATE INDEX idx_stats_date ON stats(date);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_stats_updated_at
    BEFORE UPDATE ON stats
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_updated_at();

-- Create RLS policies
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations on stats"
    ON stats
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON stats TO authenticated;
GRANT ALL ON stats TO anon;
GRANT USAGE, SELECT ON SEQUENCE stats_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stats_id_seq TO anon;

-- Ensure system employee exists
INSERT INTO employees (id, name, email, role, status)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'System', 'system@escana.app', 'Administrador', 'Activo')
ON CONFLICT (id) DO NOTHING;

-- Create function to ensure daily stats exist
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
            female_visits,
            created_by
        ) VALUES (
            current_date,
            0,
            0,
            0,
            0,
            '00000000-0000-0000-0000-000000000000'
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger to ensure daily stats exist
DROP TRIGGER IF EXISTS ensure_daily_stats_trigger ON visits;
CREATE TRIGGER ensure_daily_stats_trigger
    BEFORE INSERT ON visits
    FOR EACH STATEMENT
    EXECUTE FUNCTION ensure_daily_stats();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION ensure_daily_stats TO authenticated;


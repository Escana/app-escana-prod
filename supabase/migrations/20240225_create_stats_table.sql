-- Create stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS stats (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_visits INTEGER DEFAULT 0,
    total_incidents INTEGER DEFAULT 0,
    male_visits INTEGER DEFAULT 0,
    female_visits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on date for faster lookups
CREATE INDEX IF NOT EXISTS stats_date_idx ON stats(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_stats_updated_at
    BEFORE UPDATE ON stats
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_updated_at();

-- Create function to update stats when a visit is created
CREATE OR REPLACE FUNCTION update_stats_on_visit()
RETURNS TRIGGER AS $$
DECLARE
    client_gender TEXT;
BEGIN
    -- Get client's gender
    SELECT sexo INTO client_gender
    FROM clients
    WHERE id = NEW.client_id;

    -- Ensure stats row exists for today
    INSERT INTO stats (date)
    VALUES (CURRENT_DATE)
    ON CONFLICT (date) DO NOTHING;

    -- Update stats
    UPDATE stats
    SET 
        total_visits = total_visits + 1,
        male_visits = CASE WHEN client_gender = 'M' THEN male_visits + 1 ELSE male_visits END,
        female_visits = CASE WHEN client_gender = 'F' THEN female_visits + 1 ELSE female_visits END
    WHERE date = CURRENT_DATE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats on new visit
DROP TRIGGER IF EXISTS update_stats_on_visit ON visits;
CREATE TRIGGER update_stats_on_visit
    AFTER INSERT ON visits
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_visit();

-- Create function to update stats when an incident is created
CREATE OR REPLACE FUNCTION update_stats_on_incident()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure stats row exists for today
    INSERT INTO stats (date)
    VALUES (CURRENT_DATE)
    ON CONFLICT (date) DO NOTHING;

    -- Update stats
    UPDATE stats
    SET total_incidents = total_incidents + 1
    WHERE date = CURRENT_DATE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats on new incident
DROP TRIGGER IF EXISTS update_stats_on_incident ON incidents;
CREATE TRIGGER update_stats_on_incident
    AFTER INSERT ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_incident();

-- Enable RLS
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all authenticated users"
    ON stats FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
    ON stats FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON stats TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stats_id_seq TO authenticated;


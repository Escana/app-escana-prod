-- Remove unique constraint from RUT in clients table
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_rut_key;

-- Create visits table to track entries
CREATE TABLE visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX visits_client_id_idx ON visits(client_id);
CREATE INDEX visits_entry_time_idx ON visits(entry_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for visits table
CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for visits table
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Create policies for visits table
CREATE POLICY "Enable read access for all users" ON visits
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON visits
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON visits
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');


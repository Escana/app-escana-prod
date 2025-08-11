-- First, verify the column exists and add it if it doesn't
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS document_image TEXT;

-- Refresh the schema cache by notifying PostgREST
NOTIFY pgrst, 'reload schema';

-- Update RLS policies to explicitly include document_image
DROP POLICY IF EXISTS "Enable all operations" ON clients;

CREATE POLICY "Enable all operations"
ON clients
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant all permissions again to ensure they apply to the new column
GRANT ALL ON clients TO authenticated;
GRANT ALL ON clients TO postgres;

-- Verify the column exists in the schema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'document_image'
    ) THEN
        RAISE EXCEPTION 'document_image column does not exist in clients table';
    END IF;
END
$$;

-- Force a schema refresh
SELECT pg_notify('pgrst', 'reload schema');


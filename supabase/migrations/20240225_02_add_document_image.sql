-- Add document_image column to clients table if it doesn't exist
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS document_image TEXT;

-- Create index for document_image column
CREATE INDEX IF NOT EXISTS idx_clients_document_image ON clients(document_image);

-- Grant necessary permissions
GRANT ALL ON clients TO authenticated;


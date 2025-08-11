-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT,
  name TEXT,
  date_of_birth DATE,
  expiration_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy for establishment users to view their own documents
CREATE POLICY "Establishment users can view their clients' documents"
  ON documents
  FOR SELECT
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      WHERE c.establishment_id IN (
        SELECT establishment_id FROM establishment_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for establishment users to insert documents
CREATE POLICY "Establishment users can insert documents"
  ON documents
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      WHERE c.establishment_id IN (
        SELECT establishment_id FROM establishment_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for establishment users to update their documents
CREATE POLICY "Establishment users can update their clients' documents"
  ON documents
  FOR UPDATE
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      WHERE c.establishment_id IN (
        SELECT establishment_id FROM establishment_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for establishment users to delete their documents
CREATE POLICY "Establishment users can delete their clients' documents"
  ON documents
  FOR DELETE
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      WHERE c.establishment_id IN (
        SELECT establishment_id FROM establishment_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload documents
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
);

-- Create policy to allow users to view documents
CREATE POLICY "Allow users to view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
);


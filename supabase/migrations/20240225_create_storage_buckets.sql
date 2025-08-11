-- Create storage buckets for document and face images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documents', 'documents', true),
  ('faces', 'faces', true);

-- Set up storage policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('documents', 'faces'));

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('documents', 'faces') 
    AND auth.role() = 'authenticated'
  );


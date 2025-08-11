-- First, ensure the establishments table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.establishments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Chile',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'basic',
  description text,
  contact_name text,
  contact_email text,
  contact_phone text,
  opening_hours text,
  max_capacity integer,
  payment_method text DEFAULT 'monthly',
  notes text,
  last_payment_date timestamp with time zone,
  next_payment_date timestamp with time zone,
  payment_status text DEFAULT 'pending',
  CONSTRAINT establishments_pkey PRIMARY KEY (id),
  CONSTRAINT establishments_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT establishments_plan_check CHECK (plan IN ('basic', 'premium', 'enterprise')),
  CONSTRAINT establishments_payment_method_check CHECK (payment_method IN ('monthly', 'annual')),
  CONSTRAINT establishments_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'overdue'))
);

-- Create index on establishments
CREATE INDEX IF NOT EXISTS idx_establishments_created_by ON public.establishments USING btree (created_by);

-- Create trigger for updating the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger on establishments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_establishments_updated_at') THEN
    CREATE TRIGGER update_establishments_updated_at
    BEFORE UPDATE ON establishments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Now, fix the clients table relationship
-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS fk_client_establishment;

-- Then recreate it properly
ALTER TABLE public.clients
ADD CONSTRAINT fk_client_establishment 
FOREIGN KEY (establishment_id) 
REFERENCES public.establishments(id) 
ON DELETE SET NULL;

-- Create RLS policies for establishments
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing establishments (anyone authenticated can view)
DROP POLICY IF EXISTS "Establishments are viewable by authenticated users" ON public.establishments;
CREATE POLICY "Establishments are viewable by authenticated users" 
ON public.establishments FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy for inserting establishments (authenticated users can insert)
DROP POLICY IF EXISTS "Authenticated users can insert establishments" ON public.establishments;
CREATE POLICY "Authenticated users can insert establishments" 
ON public.establishments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating establishments (only creator or admin can update)
DROP POLICY IF EXISTS "Users can update their own establishments" ON public.establishments;
CREATE POLICY "Users can update their own establishments" 
ON public.establishments FOR UPDATE
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
  )
);

-- Policy for deleting establishments (only creator or admin can delete)
DROP POLICY IF EXISTS "Users can delete their own establishments" ON public.establishments;
CREATE POLICY "Users can delete their own establishments" 
ON public.establishments FOR DELETE
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
  )
);

-- Create RLS policies for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy for viewing clients (anyone authenticated can view)
DROP POLICY IF EXISTS "Clients are viewable by authenticated users" ON public.clients;
CREATE POLICY "Clients are viewable by authenticated users" 
ON public.clients FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy for inserting clients (authenticated users can insert)
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
CREATE POLICY "Authenticated users can insert clients" 
ON public.clients FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating clients (only users from the same establishment or admin can update)
DROP POLICY IF EXISTS "Users can update clients in their establishment" ON public.clients;
CREATE POLICY "Users can update clients in their establishment" 
ON public.clients FOR UPDATE
USING (
  (
    -- User is from the same establishment as the client
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = auth.uid() AND establishment_id = clients.establishment_id
    )
  ) OR (
    -- User is an admin or superadmin
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  )
);

-- Policy for deleting clients (only users from the same establishment or admin can delete)
DROP POLICY IF EXISTS "Users can delete clients in their establishment" ON public.clients;
CREATE POLICY "Users can delete clients in their establishment" 
ON public.clients FOR DELETE
USING (
  (
    -- User is from the same establishment as the client
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = auth.uid() AND establishment_id = clients.establishment_id
    )
  ) OR (
    -- User is an admin or superadmin
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  )
);


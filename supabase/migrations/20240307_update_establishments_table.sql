-- This migration updates the establishments table to include all fields needed for the local management interface

-- Check if the establishments table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'establishments') THEN
        -- Create the establishments table if it doesn't exist
        CREATE TABLE public.establishments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            country TEXT NOT NULL DEFAULT 'Chile',
            status TEXT NOT NULL DEFAULT 'active',
            plan TEXT NOT NULL DEFAULT 'basic',
            description TEXT,
            contact_name TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            opening_hours TEXT,
            max_capacity INTEGER,
            payment_method TEXT NOT NULL DEFAULT 'monthly',
            notes TEXT,
            created_by UUID NOT NULL REFERENCES public.employees(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add comment to the table
        COMMENT ON TABLE public.establishments IS 'Stores information about establishments registered in the platform';
    ELSE
        -- Add new columns if they don't exist
        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'status') THEN
                ALTER TABLE public.establishments ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'plan') THEN
                ALTER TABLE public.establishments ADD COLUMN plan TEXT NOT NULL DEFAULT 'basic';
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'description') THEN
                ALTER TABLE public.establishments ADD COLUMN description TEXT;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'contact_name') THEN
                ALTER TABLE public.establishments ADD COLUMN contact_name TEXT;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'contact_email') THEN
                ALTER TABLE public.establishments ADD COLUMN contact_email TEXT;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'contact_phone') THEN
                ALTER TABLE public.establishments ADD COLUMN contact_phone TEXT;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'opening_hours') THEN
                ALTER TABLE public.establishments ADD COLUMN opening_hours TEXT;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'max_capacity') THEN
                ALTER TABLE public.establishments ADD COLUMN max_capacity INTEGER;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'payment_method') THEN
                ALTER TABLE public.establishments ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'monthly';
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'notes') THEN
                ALTER TABLE public.establishments ADD COLUMN notes TEXT;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'last_payment_date') THEN
                ALTER TABLE public.establishments ADD COLUMN last_payment_date TIMESTAMP WITH TIME ZONE;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'next_payment_date') THEN
                ALTER TABLE public.establishments ADD COLUMN next_payment_date TIMESTAMP WITH TIME ZONE;
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'payment_status') THEN
                ALTER TABLE public.establishments ADD COLUMN payment_status TEXT DEFAULT 'pending';
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;

        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'establishments' AND column_name = 'plan') THEN
                ALTER TABLE public.establishments ADD COLUMN plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise'));
            END IF;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;
    END IF;
END
$$;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_establishments_updated_at ON public.establishments;
CREATE TRIGGER update_establishments_updated_at
BEFORE UPDATE ON public.establishments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function to count users per establishment
CREATE OR REPLACE FUNCTION count_users_per_establishment(establishment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM public.employees
    WHERE establishment_id = $1;
    
    RETURN user_count;
END;
$$ LANGUAGE plpgsql;

-- Crear vista para contar usuarios por establecimiento
CREATE OR REPLACE VIEW establishment_user_counts AS
SELECT 
  e.id as establishment_id,
  COUNT(em.id) as user_count
FROM establishments e
LEFT JOIN employees em ON em.establishment_id = e.id
GROUP BY e.id;

-- Función para obtener el conteo de usuarios
CREATE OR REPLACE FUNCTION get_establishment_user_count(establishment_id UUID)
RETURNS INTEGER AS $$
  SELECT user_count 
  FROM establishment_user_counts 
  WHERE establishment_id = $1;
$$ LANGUAGE sql;

-- Trigger para actualizar next_payment_date
CREATE OR REPLACE FUNCTION update_next_payment_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_payment_date IS NOT NULL THEN
    NEW.next_payment_date := NEW.last_payment_date + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_next_payment_date
  BEFORE INSERT OR UPDATE OF last_payment_date
  ON establishments
  FOR EACH ROW
  EXECUTE FUNCTION update_next_payment_date();

-- Enable Row Level Security
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Create policies for establishments
DROP POLICY IF EXISTS "Superadmins can do anything with establishments" ON public.establishments;
CREATE POLICY "Superadmins can do anything with establishments"
ON public.establishments
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.id = auth.uid()
        AND employees.role = 'superadmin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.id = auth.uid()
        AND employees.role = 'superadmin'
    )
);

DROP POLICY IF EXISTS "Admins can read their own establishments" ON public.establishments;
CREATE POLICY "Admins can read their own establishments"
ON public.establishments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.id = auth.uid()
        AND employees.role = 'admin'
        AND employees.establishment_id = establishments.id
    )
);

DROP POLICY IF EXISTS "Guards can read their own establishments" ON public.establishments;
CREATE POLICY "Guards can read their own establishments"
ON public.establishments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.id = auth.uid()
        AND employees.role = 'guardia'
        AND employees.establishment_id = establishments.id
    )
);


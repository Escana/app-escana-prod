-- Verificar si la tabla establishments existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'establishments') THEN
        CREATE TABLE public.establishments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            address TEXT,
            city TEXT,
            country TEXT DEFAULT 'Chile',
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            status TEXT DEFAULT 'active',
            plan TEXT DEFAULT 'basic',
            description TEXT,
            contact_name TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            opening_hours TEXT,
            max_capacity INTEGER,
            payment_method TEXT DEFAULT 'monthly',
            notes TEXT,
            last_payment_date TIMESTAMP WITH TIME ZONE,
            next_payment_date TIMESTAMP WITH TIME ZONE,
            payment_status TEXT DEFAULT 'pending'
        );
        
        -- Crear índices para mejorar el rendimiento
        CREATE INDEX idx_establishments_created_by ON public.establishments(created_by);
        CREATE INDEX idx_establishments_status ON public.establishments(status);
        CREATE INDEX idx_establishments_plan ON public.establishments(plan);
    END IF;
END
$$;

-- Habilitar Row Level Security
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Establishments are viewable by everyone" ON public.establishments;
DROP POLICY IF EXISTS "Establishments are insertable by authenticated users" ON public.establishments;
DROP POLICY IF EXISTS "Establishments are updatable by authenticated users" ON public.establishments;
DROP POLICY IF EXISTS "Establishments are deletable by authenticated users" ON public.establishments;

-- Crear políticas RLS más permisivas para desarrollo
CREATE POLICY "Establishments are viewable by everyone" 
ON public.establishments FOR SELECT 
USING (true);

CREATE POLICY "Establishments are insertable by authenticated users" 
ON public.establishments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Establishments are updatable by authenticated users" 
ON public.establishments FOR UPDATE 
USING (true);

CREATE POLICY "Establishments are deletable by authenticated users" 
ON public.establishments FOR DELETE 
USING (true);

-- Crear trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_establishments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_establishments_updated_at ON public.establishments;
CREATE TRIGGER update_establishments_updated_at
BEFORE UPDATE ON public.establishments
FOR EACH ROW
EXECUTE FUNCTION update_establishments_updated_at();

-- Crear trigger para calcular next_payment_date basado en payment_method
CREATE OR REPLACE FUNCTION calculate_next_payment_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_payment_date IS NOT NULL AND NEW.payment_method IS NOT NULL THEN
        CASE NEW.payment_method
            WHEN 'monthly' THEN
                NEW.next_payment_date := NEW.last_payment_date + INTERVAL '1 month';
            WHEN 'quarterly' THEN
                NEW.next_payment_date := NEW.last_payment_date + INTERVAL '3 months';
            WHEN 'yearly' THEN
                NEW.next_payment_date := NEW.last_payment_date + INTERVAL '1 year';
            ELSE
                NEW.next_payment_date := NEW.last_payment_date + INTERVAL '1 month';
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_next_payment_date ON public.establishments;
CREATE TRIGGER calculate_next_payment_date
BEFORE INSERT OR UPDATE OF last_payment_date, payment_method ON public.establishments
FOR EACH ROW
EXECUTE FUNCTION calculate_next_payment_date();


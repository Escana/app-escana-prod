-- Crear tabla de establecimientos
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Chile',
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_establishments_created_by ON establishments(created_by);

-- Habilitar RLS
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
-- Política para superadmin: puede ver todos los establecimientos
CREATE POLICY "Superadmin puede ver todos los establecimientos" 
ON establishments FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para admin: puede ver su establecimiento
CREATE POLICY "Admin puede ver su establecimiento" 
ON establishments FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT establishment_id FROM employees WHERE id = auth.uid()
  )
);

-- Política para guardia: puede ver su establecimiento
CREATE POLICY "Guardia puede ver su establecimiento" 
ON establishments FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT establishment_id FROM employees WHERE id = auth.uid()
  )
);

-- Política para superadmin: puede crear establecimientos
CREATE POLICY "Superadmin puede crear establecimientos" 
ON establishments FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para superadmin: puede actualizar establecimientos
CREATE POLICY "Superadmin puede actualizar establecimientos" 
ON establishments FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para superadmin: puede eliminar establecimientos
CREATE POLICY "Superadmin puede eliminar establecimientos" 
ON establishments FOR DELETE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Trigger para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_establishments_timestamp
BEFORE UPDATE ON establishments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


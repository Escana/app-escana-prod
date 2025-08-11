-- Crear la tabla de establecimientos si no existe
CREATE TABLE IF NOT EXISTS establishments (
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
  payment_method TEXT DEFAULT 'monthly',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear políticas RLS para la tabla de establecimientos
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los superadmins ver todos los establecimientos
CREATE POLICY "Superadmins can view all establishments" 
  ON establishments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.user_id = auth.uid() 
      AND employees.role = 'superadmin'
    )
  );

-- Política para permitir a los superadmins insertar establecimientos
CREATE POLICY "Superadmins can insert establishments" 
  ON establishments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.user_id = auth.uid() 
      AND employees.role = 'superadmin'
    )
  );

-- Política para permitir a los superadmins actualizar establecimientos
CREATE POLICY "Superadmins can update establishments" 
  ON establishments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.user_id = auth.uid() 
      AND employees.role = 'superadmin'
    )
  );

-- Política para permitir a los superadmins eliminar establecimientos
CREATE POLICY "Superadmins can delete establishments" 
  ON establishments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.user_id = auth.uid() 
      AND employees.role = 'superadmin'
    )
  );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS establishments_name_idx ON establishments (name);
CREATE INDEX IF NOT EXISTS establishments_city_idx ON establishments (city);
CREATE INDEX IF NOT EXISTS establishments_status_idx ON establishments (status);


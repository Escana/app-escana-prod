-- 1. Primero, verificar y actualizar el tipo enum employee_role
DO $$
BEGIN
    -- Verificar si el tipo enum ya existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_role') THEN
        -- Crear el tipo enum si no existe
        CREATE TYPE employee_role AS ENUM ('guardia', 'admin', 'superadmin');
    ELSE
        -- Verificar si 'superadmin' ya está en el enum
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'employee_role')
            AND enumlabel = 'superadmin'
        ) THEN
            -- Añadir 'superadmin' al enum
            ALTER TYPE employee_role ADD VALUE 'superadmin';
        END IF;
    END IF;
END
$$;

-- 2. Crear tabla de establecimientos
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Chile',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Actualizar la tabla de empleados para incluir los nuevos campos
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role employee_role NOT NULL DEFAULT 'guardia',
ADD COLUMN IF NOT EXISTS establishment_id UUID,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- 4. Añadir las restricciones de clave foránea
ALTER TABLE employees
DROP CONSTRAINT IF EXISTS fk_establishment;

ALTER TABLE employees
ADD CONSTRAINT fk_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

ALTER TABLE employees
DROP CONSTRAINT IF EXISTS fk_created_by;

ALTER TABLE employees
ADD CONSTRAINT fk_created_by
FOREIGN KEY (created_by)
REFERENCES employees(id)
ON DELETE SET NULL;

-- 5. Actualizar la tabla establishments para añadir la referencia a employees
ALTER TABLE establishments
DROP CONSTRAINT IF EXISTS fk_establishments_created_by;

ALTER TABLE establishments
ADD CONSTRAINT fk_establishments_created_by
FOREIGN KEY (created_by)
REFERENCES employees(id)
ON DELETE SET NULL;

-- 6. Añadir establishment_id a otras tablas
-- Incidents
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS establishment_id UUID;

ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS fk_incident_establishment;

ALTER TABLE incidents
ADD CONSTRAINT fk_incident_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

-- Clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS establishment_id UUID;

ALTER TABLE clients
DROP CONSTRAINT IF EXISTS fk_client_establishment;

ALTER TABLE clients
ADD CONSTRAINT fk_client_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

-- Guest Lists
ALTER TABLE guest_lists
ADD COLUMN IF NOT EXISTS establishment_id UUID;

ALTER TABLE guest_lists
DROP CONSTRAINT IF EXISTS fk_guest_list_establishment;

ALTER TABLE guest_lists
ADD CONSTRAINT fk_guest_list_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

-- 7. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_establishment ON employees(establishment_id);
CREATE INDEX IF NOT EXISTS idx_establishments_created_by ON establishments(created_by);

-- 8. Habilitar RLS en establishments si no está habilitado
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- 9. Actualizar las políticas RLS para la tabla de empleados
DROP POLICY IF EXISTS "Empleados visibles para usuarios autenticados" ON employees;
DROP POLICY IF EXISTS "Superadmin puede ver todos los empleados" ON employees;
DROP POLICY IF EXISTS "Admin puede ver empleados de su establecimiento" ON employees;
DROP POLICY IF EXISTS "Guardia solo puede verse a sí mismo" ON employees;
DROP POLICY IF EXISTS "Superadmin puede crear cualquier empleado" ON employees;
DROP POLICY IF EXISTS "Admin puede crear guardias en su establecimiento" ON employees;
DROP POLICY IF EXISTS "Superadmin puede actualizar cualquier empleado" ON employees;
DROP POLICY IF EXISTS "Admin puede actualizar guardias de su establecimiento" ON employees;
DROP POLICY IF EXISTS "Guardia puede actualizar su propio perfil" ON employees;
DROP POLICY IF EXISTS "Superadmin puede eliminar cualquier empleado" ON employees;
DROP POLICY IF EXISTS "Admin puede eliminar guardias de su establecimiento" ON employees;

-- Política para superadmin: puede ver todos los empleados
CREATE POLICY "Superadmin puede ver todos los empleados" 
ON employees FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para admin: puede ver empleados de su establecimiento
CREATE POLICY "Admin puede ver empleados de su establecimiento" 
ON employees FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'admin'
  ) AND 
  establishment_id IN (
    SELECT establishment_id FROM employees WHERE id = auth.uid()
  )
);

-- Política para guardia: solo puede verse a sí mismo
CREATE POLICY "Guardia solo puede verse a sí mismo" 
ON employees FOR SELECT 
TO authenticated 
USING (
  id = auth.uid()
);

-- Política para superadmin: puede crear cualquier empleado
CREATE POLICY "Superadmin puede crear cualquier empleado" 
ON employees FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para admin: puede crear guardias en su establecimiento
CREATE POLICY "Admin puede crear guardias en su establecimiento" 
ON employees FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'admin'
  ) AND 
  role = 'guardia' AND
  establishment_id IN (
    SELECT establishment_id FROM employees WHERE id = auth.uid()
  )
);

-- Política para superadmin: puede actualizar cualquier empleado
CREATE POLICY "Superadmin puede actualizar cualquier empleado" 
ON employees FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para admin: puede actualizar guardias de su establecimiento
CREATE POLICY "Admin puede actualizar guardias de su establecimiento" 
ON employees FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'admin'
  ) AND 
  role = 'guardia' AND
  establishment_id IN (
    SELECT establishment_id FROM employees WHERE id = auth.uid()
  )
);

-- Política para guardia: puede actualizar su propio perfil
CREATE POLICY "Guardia puede actualizar su propio perfil" 
ON employees FOR UPDATE 
TO authenticated 
USING (
  id = auth.uid()
);

-- Política para superadmin: puede eliminar cualquier empleado
CREATE POLICY "Superadmin puede eliminar cualquier empleado" 
ON employees FOR DELETE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'superadmin'
  )
);

-- Política para admin: puede eliminar guardias de su establecimiento
CREATE POLICY "Admin puede eliminar guardias de su establecimiento" 
ON employees FOR DELETE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM employees WHERE role = 'admin'
  ) AND 
  role = 'guardia' AND
  establishment_id IN (
    SELECT establishment_id FROM employees WHERE id = auth.uid()
  )
);

-- 10. Crear políticas RLS para establishments
DROP POLICY IF EXISTS "Superadmin puede ver todos los establecimientos" ON establishments;
DROP POLICY IF EXISTS "Admin puede ver su establecimiento" ON establishments;
DROP POLICY IF EXISTS "Guardia puede ver su establecimiento" ON establishments;
DROP POLICY IF EXISTS "Superadmin puede crear establecimientos" ON establishments;
DROP POLICY IF EXISTS "Superadmin puede actualizar establecimientos" ON establishments;
DROP POLICY IF EXISTS "Superadmin puede eliminar establecimientos" ON establishments;

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

-- 11. Crear trigger para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_establishments_timestamp ON establishments;

CREATE TRIGGER update_establishments_timestamp
BEFORE UPDATE ON establishments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 12. Actualizar RLS para otras tablas
-- Incidents
DROP POLICY IF EXISTS incidents_establishment_policy ON incidents;

CREATE POLICY incidents_establishment_policy ON incidents
FOR ALL
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin' OR
   establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);

-- Clients
DROP POLICY IF EXISTS clients_establishment_policy ON clients;

CREATE POLICY clients_establishment_policy ON clients
FOR ALL
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin' OR
   establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);

-- Guest Lists
DROP POLICY IF EXISTS guest_lists_establishment_policy ON guest_lists;

CREATE POLICY guest_lists_establishment_policy ON guest_lists
FOR ALL
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin' OR
   establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);


-- Update employees table to include role-based access control
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role employee_role NOT NULL DEFAULT 'guardia',
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES establishments(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES employees(id);

-- Create establishments table
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
-- ALTER TABLE employees
-- ADD CONSTRAINT fk_establishment
-- FOREIGN KEY (establishment_id)
-- REFERENCES establishments(id)
-- ON DELETE SET NULL;

-- ALTER TABLE employees
-- ADD CONSTRAINT fk_created_by
-- FOREIGN KEY (created_by)
-- REFERENCES employees(id)
-- ON DELETE SET NULL;

-- Add establishment_id to incidents table
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS establishment_id UUID,
ADD CONSTRAINT fk_incident_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

-- Add establishment_id to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS establishment_id UUID,
ADD CONSTRAINT fk_client_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

-- Add establishment_id to guest_lists table
ALTER TABLE guest_lists
ADD COLUMN IF NOT EXISTS establishment_id UUID,
ADD CONSTRAINT fk_guest_list_establishment
FOREIGN KEY (establishment_id)
REFERENCES establishments(id)
ON DELETE SET NULL;

-- Update RLS policies for employees
-- CREATE POLICY employees_superadmin_policy ON employees
-- FOR ALL
-- TO authenticated
-- USING (
--   (SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin'
-- );

-- CREATE POLICY employees_admin_policy ON employees
-- FOR ALL
-- TO authenticated
-- USING (
--   ((SELECT role FROM employees WHERE id = auth.uid()) = 'admin' AND 
--    (created_by = auth.uid() OR establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid())))
-- );

-- CREATE POLICY employees_view_self_policy ON employees
-- FOR SELECT
-- TO authenticated
-- USING (id = auth.uid());

-- Update RLS policies for establishments
CREATE POLICY establishments_superadmin_policy ON establishments
FOR ALL
TO authenticated
USING (
  (SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin'
);

CREATE POLICY establishments_admin_view_policy ON establishments
FOR SELECT
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'admin' AND 
   id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);

-- Update RLS policies for incidents, clients, and guest_lists
-- These policies ensure that users can only access data related to their establishment
CREATE POLICY incidents_establishment_policy ON incidents
FOR ALL
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin' OR
   establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);

CREATE POLICY clients_establishment_policy ON clients
FOR ALL
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin' OR
   establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);

CREATE POLICY guest_lists_establishment_policy ON guest_lists
FOR ALL
TO authenticated
USING (
  ((SELECT role FROM employees WHERE id = auth.uid()) = 'superadmin' OR
   establishment_id = (SELECT establishment_id FROM employees WHERE id = auth.uid()))
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_establishment ON employees(establishment_id);

-- Actualizar las políticas RLS para la tabla de empleados
DROP POLICY IF EXISTS "Empleados visibles para usuarios autenticados" ON employees;

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


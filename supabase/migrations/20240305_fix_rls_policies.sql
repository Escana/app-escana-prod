-- Actualizar políticas RLS para establishments
DROP POLICY IF EXISTS "Establishments are viewable by authenticated users" ON establishments;
DROP POLICY IF EXISTS "Establishments are insertable by superadmins" ON establishments;
DROP POLICY IF EXISTS "Establishments are updatable by superadmins" ON establishments;
DROP POLICY IF EXISTS "Establishments are deletable by superadmins" ON establishments;

-- Crear políticas más permisivas para establishments
CREATE POLICY "Establishments are viewable by authenticated users"
ON establishments FOR SELECT
USING (auth.role() = 'authenticated' OR auth.uid() IN (SELECT id FROM employees));

CREATE POLICY "Establishments are insertable by superadmins"
ON establishments FOR INSERT
WITH CHECK ((auth.role() = 'authenticated' OR auth.uid() IN (SELECT id FROM employees WHERE role = 'superadmin')));

CREATE POLICY "Establishments are updatable by superadmins"
ON establishments FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.uid() IN (SELECT id FROM employees WHERE role = 'superadmin'))
WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IN (SELECT id FROM employees WHERE role = 'superadmin'));

CREATE POLICY "Establishments are deletable by superadmins"
ON establishments FOR DELETE
USING (auth.role() = 'authenticated' OR auth.uid() IN (SELECT id FROM employees WHERE role = 'superadmin'));

-- Verificar que RLS está habilitado
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Asegurar que el rol anónimo puede usar las políticas
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON establishments TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON establishments TO authenticated;


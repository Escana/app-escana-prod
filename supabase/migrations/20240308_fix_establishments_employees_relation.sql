-- Asegurar que la relación entre establishments y employees está correctamente configurada
ALTER TABLE IF EXISTS employees
DROP CONSTRAINT IF EXISTS employees_establishment_id_fkey;

ALTER TABLE employees
ADD CONSTRAINT employees_establishment_id_fkey 
FOREIGN KEY (establishment_id) 
REFERENCES establishments(id) 
ON DELETE CASCADE;

-- Crear un índice para mejorar el rendimiento de las consultas de conteo
CREATE INDEX IF NOT EXISTS idx_employees_establishment_id 
ON employees(establishment_id);


-- Asegurarse de que la tabla establishments tenga los campos necesarios
ALTER TABLE IF EXISTS establishments
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_establishments_id ON establishments(id);

-- Asegurarse de que la relación entre establishments y employees esté correctamente definida
ALTER TABLE IF EXISTS employees
DROP CONSTRAINT IF EXISTS employees_establishment_id_fkey,
ADD CONSTRAINT employees_establishment_id_fkey 
FOREIGN KEY (establishment_id) 
REFERENCES establishments(id) 
ON DELETE SET NULL;

-- Comentarios para documentar la relación
COMMENT ON CONSTRAINT employees_establishment_id_fkey ON employees IS 'Relación entre empleados y establecimientos';


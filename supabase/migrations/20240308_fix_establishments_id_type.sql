-- Crear una tabla temporal para almacenar la correspondencia entre IDs antiguos y nuevos
CREATE TABLE temp_establishment_id_map (
  old_id TEXT PRIMARY KEY,
  new_id UUID NOT NULL DEFAULT extensions.uuid_generate_v4()
);

-- Insertar los IDs actuales en la tabla de mapeo
INSERT INTO temp_establishment_id_map (old_id)
SELECT id::TEXT FROM establishments;

-- Crear una nueva tabla con la estructura correcta
CREATE TABLE new_establishments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NULL,
  city TEXT NULL,
  country TEXT NULL DEFAULT 'Chile'::text,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'::text,
  plan TEXT NOT NULL DEFAULT 'basic'::text,
  description TEXT NULL,
  contact_name TEXT NULL,
  contact_email TEXT NULL,
  contact_phone TEXT NULL,
  opening_hours TEXT NULL,
  max_capacity INTEGER NULL,
  payment_method TEXT NOT NULL DEFAULT 'monthly'::text,
  notes TEXT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE NULL,
  next_payment_date TIMESTAMP WITH TIME ZONE NULL,
  payment_status TEXT NULL DEFAULT 'pending'::text
);

-- Copiar los datos de la tabla antigua a la nueva, usando los nuevos UUIDs
INSERT INTO new_establishments (
  id, name, address, city, country, created_by, created_at, updated_at,
  status, plan, description, contact_name, contact_email, contact_phone,
  opening_hours, max_capacity, payment_method, notes, last_payment_date,
  next_payment_date, payment_status
)
SELECT 
  m.new_id, e.name, e.address, e.city, e.country, e.created_by, e.created_at, e.updated_at,
  e.status, e.plan, e.description, e.contact_name, e.contact_email, e.contact_phone,
  e.opening_hours, e.max_capacity, e.payment_method, e.notes, e.last_payment_date,
  e.next_payment_date, e.payment_status
FROM establishments e
JOIN temp_establishment_id_map m ON e.id::TEXT = m.old_id;

-- Actualizar las referencias en la tabla employees
UPDATE employees e
SET establishment_id = m.new_id
FROM temp_establishment_id_map m
WHERE e.establishment_id::TEXT = m.old_id;

-- Renombrar las tablas
ALTER TABLE establishments RENAME TO old_establishments;
ALTER TABLE new_establishments RENAME TO establishments;

-- Recrear los índices y triggers
CREATE INDEX IF NOT EXISTS idx_establishments_created_by ON establishments(created_by);

-- Recrear los triggers
CREATE TRIGGER update_establishments_timestamp BEFORE
UPDATE ON establishments FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_establishments_updated_at BEFORE
UPDATE ON establishments FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_establishments_updated_at BEFORE
UPDATE ON establishments FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_next_payment_date BEFORE INSERT
OR
UPDATE OF last_payment_date ON establishments FOR EACH ROW
EXECUTE FUNCTION update_next_payment_date();

-- Crear una vista para mantener compatibilidad con código antiguo
CREATE OR REPLACE VIEW legacy_establishments AS
SELECT 
  m.old_id as id,
  e.name,
  e.address,
  e.city,
  e.country,
  e.created_by,
  e.created_at,
  e.updated_at,
  e.status,
  e.plan,
  e.description,
  e.contact_name,
  e.contact_email,
  e.contact_phone,
  e.opening_hours,
  e.max_capacity,
  e.payment_method,
  e.notes,
  e.last_payment_date,
  e.next_payment_date,
  e.payment_status
FROM establishments e
JOIN temp_establishment_id_map m ON e.id = m.new_id;

-- Opcional: Eliminar la tabla antigua después de verificar que todo funciona
-- DROP TABLE old_establishments;
-- DROP TABLE temp_establishment_id_map;


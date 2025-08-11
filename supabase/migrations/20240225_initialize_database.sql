-- Primero eliminamos todo lo existente para empezar limpio
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TYPE IF EXISTS employee_role CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;
DROP TYPE IF EXISTS incident_type CASCADE;
DROP TYPE IF EXISTS incident_status CASCADE;

-- Crear tipos ENUM
CREATE TYPE employee_role AS ENUM ('Seguridad', 'Administrador', 'Recepcionista');
CREATE TYPE employee_status AS ENUM ('Activo', 'Inactivo');
CREATE TYPE incident_type AS ENUM (
  'AGRESION',
  'ACOSO',
  'CONSUMO_DROGAS',
  'ROBO',
  'DANOS',
  'ALTERACION_ORDEN',
  'DOCUMENTO_FALSO',
  'EXCESO_ALCOHOL',
  'AMENAZAS',
  'ACCESO_NO_AUTORIZADO'
);
CREATE TYPE incident_status AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED');

-- Crear tabla de empleados primero ya que otras tablas dependen de ella
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role employee_role NOT NULL DEFAULT 'Seguridad',
  status employee_status NOT NULL DEFAULT 'Activo',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  rut TEXT NOT NULL,
  nacionalidad TEXT NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F')) NOT NULL,
  edad INTEGER,
  nacimiento DATE NOT NULL,
  vencimiento DATE,
  photo TEXT,
  is_banned BOOLEAN DEFAULT false,
  is_guest BOOLEAN DEFAULT false,
  ban_level INTEGER,
  ban_duration TEXT,
  ban_start_date TIMESTAMPTZ,
  ban_end_date TIMESTAMPTZ,
  ban_reason TEXT,
  ban_description TEXT,
  guest_list_id UUID,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de incidentes
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  type incident_type NOT NULL,
  description TEXT NOT NULL,
  status incident_status NOT NULL DEFAULT 'PENDING',
  severity INTEGER CHECK (severity BETWEEN 1 AND 5) NOT NULL,
  location TEXT,
  evidence_urls TEXT[],
  witnesses TEXT[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  resolution_notes TEXT
);

-- Crear tabla de visitas
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  entry_time TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  exit_time TIMESTAMPTZ,
  status VARCHAR DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de estadísticas
CREATE TABLE stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visits INTEGER DEFAULT 0,
  total_incidents INTEGER DEFAULT 0,
  male_visits INTEGER DEFAULT 0,
  female_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_clients_rut ON clients(rut);
CREATE INDEX idx_visits_client_id ON visits(client_id);
CREATE INDEX idx_visits_entry_time ON visits(entry_time);
CREATE INDEX idx_incidents_client_id ON incidents(client_id);
CREATE INDEX idx_incidents_employee_id ON incidents(employee_id);
CREATE INDEX idx_stats_date ON stats(date);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stats_updated_at
  BEFORE UPDATE ON stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear visitas y actualizar estadísticas
CREATE OR REPLACE FUNCTION create_visit(
  p_client_id UUID,
  p_entry_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visit_id UUID;
BEGIN
  -- Insertar la visita
  INSERT INTO visits (
      id,
      client_id,
      entry_time,
      status,
      created_at,
      updated_at
  ) VALUES (
      gen_random_uuid(),
      p_client_id,
      p_entry_time,
      'ACTIVE',
      NOW(),
      NOW()
  )
  RETURNING id INTO v_visit_id;

  -- Actualizar estadísticas
  INSERT INTO stats (
      date,
      total_visits,
      male_visits,
      female_visits
  )
  VALUES (
      CURRENT_DATE,
      1,
      CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
      CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date) 
  DO UPDATE SET
      total_visits = stats.total_visits + 1,
      male_visits = stats.male_visits + 
          CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
      female_visits = stats.female_visits + 
          CASE WHEN (SELECT sexo FROM clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END;

  RETURN v_visit_id;
END;
$$;

-- Habilitar RLS en todas las tablas
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Enable all operations" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations" ON stats FOR ALL USING (true) WITH CHECK (true);

-- Otorgar permisos
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insertar empleado del sistema
INSERT INTO employees (id, name, email, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System',
  'system@escana.app',
  'Administrador',
  'Activo'
) ON CONFLICT (id) DO NOTHING;

-- Insertar algunos empleados de prueba
INSERT INTO employees (name, email, role, status)
VALUES 
  ('Rodrigo Bustamante', 'rodrigo.bustamante@example.com', 'Administrador', 'Activo'),
  ('María González', 'maria.gonzalez@example.com', 'Seguridad', 'Activo'),
  ('Carlos Rodríguez', 'carlos.rodriguez@example.com', 'Recepcionista', 'Activo')
ON CONFLICT (email) DO NOTHING;


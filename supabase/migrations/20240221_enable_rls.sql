-- Habilitar RLS para las tablas
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir SELECT en incidents
CREATE POLICY "Enable read access for all users" ON incidents
    FOR SELECT
    USING (true);

-- Crear política para permitir SELECT en clients
CREATE POLICY "Enable read access for all users" ON clients
    FOR SELECT
    USING (true);

-- Crear política para permitir SELECT en employees
CREATE POLICY "Enable read access for all users" ON employees
    FOR SELECT
    USING (true);

-- Crear política para permitir INSERT en incidents
CREATE POLICY "Enable insert for authenticated users" ON incidents
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Crear política para permitir UPDATE en incidents
CREATE POLICY "Enable update for authenticated users" ON incidents
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');


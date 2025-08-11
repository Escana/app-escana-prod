-- Create enum types for employee roles and status
CREATE TYPE employee_role AS ENUM ('Seguridad', 'Administrador', 'Recepcionista');
CREATE TYPE employee_status AS ENUM ('Activo', 'Inactivo');

-- Create employees table
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role employee_role NOT NULL DEFAULT 'Seguridad',
    status employee_status NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX employees_email_idx ON employees(email);

-- Create index on role for filtering
CREATE INDEX employees_role_idx ON employees(role);

-- Create index on status for filtering
CREATE INDEX employees_status_idx ON employees(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some initial data for testing
INSERT INTO employees (name, email, role, status) VALUES
('Rodrigo Bustamante', 'rodrigo.bustamante@example.com', 'Administrador', 'Activo'),
('María González', 'maria.gonzalez@example.com', 'Seguridad', 'Activo'),
('Carlos Rodríguez', 'carlos.rodriguez@example.com', 'Recepcionista', 'Activo'),
('Ana Martínez', 'ana.martinez@example.com', 'Seguridad', 'Activo'),
('Luis Pérez', 'luis.perez@example.com', 'Seguridad', 'Activo');

-- Add Row Level Security (RLS) policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing employees (all authenticated users can view)
CREATE POLICY "Users can view employees"
    ON employees FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for inserting employees (only administrators)
CREATE POLICY "Administrators can insert employees"
    ON employees FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'Administrador');

-- Create policy for updating employees (only administrators)
CREATE POLICY "Administrators can update employees"
    ON employees FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'Administrador')
    WITH CHECK (auth.jwt() ->> 'role' = 'Administrador');

-- Create policy for deleting employees (only administrators)
CREATE POLICY "Administrators can delete employees"
    ON employees FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'Administrador');


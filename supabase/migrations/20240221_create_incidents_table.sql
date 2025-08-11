-- Create enum types for incident management
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

CREATE TYPE incident_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'ARCHIVED'
);

CREATE TYPE incident_severity AS ENUM (
    '1',
    '2',
    '3',
    '4',
    '5'
);

-- Create incidents table
CREATE TABLE incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    type incident_type NOT NULL,
    description TEXT NOT NULL,
    status incident_status NOT NULL DEFAULT 'PENDING',
    severity incident_severity NOT NULL,
    location TEXT,
    evidence_urls TEXT[],
    witnesses TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    resolution_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX incidents_client_id_idx ON incidents(client_id);
CREATE INDEX incidents_employee_id_idx ON incidents(employee_id);
CREATE INDEX incidents_type_idx ON incidents(type);
CREATE INDEX incidents_status_idx ON incidents(status);
CREATE INDEX incidents_severity_idx ON incidents(severity);
CREATE INDEX incidents_created_at_idx ON incidents(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security (RLS) policies
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing incidents (all authenticated users can view)
CREATE POLICY "Users can view incidents"
    ON incidents FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for inserting incidents (authenticated users)
CREATE POLICY "Users can create incidents"
    ON incidents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy for updating incidents (only administrators and security)
CREATE POLICY "Staff can update incidents"
    ON incidents FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('Administrador', 'Seguridad')
    )
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('Administrador', 'Seguridad')
    );

-- Create policy for deleting incidents (only administrators)
CREATE POLICY "Administrators can delete incidents"
    ON incidents FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'Administrador');

-- Add some initial test data
INSERT INTO incidents (
    client_id,
    employee_id,
    type,
    description,
    status,
    severity,
    location
) 
SELECT 
    (SELECT id FROM clients ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM employees ORDER BY RANDOM() LIMIT 1),
    unnest(ARRAY[
        'AGRESION',
        'ACOSO',
        'CONSUMO_DROGAS',
        'ROBO',
        'DANOS'
    ]::incident_type[]),
    unnest(ARRAY[
        'Cliente agresivo expulsado tras altercado con personal de seguridad',
        'Acoso reportado por clienta hacia otro cliente en la barra',
        'Cliente sorprendido consumiendo sustancias ilegales en el baño',
        'Robo de pertenencias reportado en el área de guardarropa',
        'Daño intencional a equipo de sonido por cliente ebrio'
    ]),
    'PENDING',
    unnest(ARRAY['1', '2', '3', '4', '5']::incident_severity[]),
    'Bar principal'
FROM generate_series(1, 5);


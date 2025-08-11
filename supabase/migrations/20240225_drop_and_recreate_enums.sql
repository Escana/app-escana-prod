-- Primero eliminamos las tablas que dependen de los ENUMs
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Ahora eliminamos los tipos ENUM existentes
DROP TYPE IF EXISTS employee_role CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;
DROP TYPE IF EXISTS incident_type CASCADE;
DROP TYPE IF EXISTS incident_status CASCADE;

-- Recreamos los tipos ENUM
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


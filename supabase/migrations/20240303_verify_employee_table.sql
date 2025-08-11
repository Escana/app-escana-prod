-- Verificar la estructura de la tabla employees
DO $$
BEGIN
    -- Verificar si la tabla employees existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'employees'
    ) THEN
        RAISE EXCEPTION 'La tabla employees no existe';
    END IF;

    -- Verificar las columnas necesarias
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'id'
    ) THEN
        RAISE EXCEPTION 'La columna id no existe en la tabla employees';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'email'
    ) THEN
        RAISE EXCEPTION 'La columna email no existe en la tabla employees';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'role'
    ) THEN
        RAISE EXCEPTION 'La columna role no existe en la tabla employees';
    END IF;

    -- Verificar el tipo de datos de id
    IF (
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'id'
    ) != 'uuid' THEN
        RAISE NOTICE 'La columna id no es de tipo UUID. Esto podría causar problemas.';
    END IF;

    -- Verificar si hay empleados
    IF NOT EXISTS (
        SELECT 1
        FROM employees
    ) THEN
        RAISE NOTICE 'No hay empleados en la tabla.';
    END IF;

    -- Mostrar información sobre la tabla
    RAISE NOTICE 'Estructura de la tabla employees verificada correctamente.';
END $$;

-- Mostrar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'employees'
ORDER BY 
    ordinal_position;

-- Mostrar los empleados
SELECT id, email, role, password, name
FROM employees
ORDER BY email;


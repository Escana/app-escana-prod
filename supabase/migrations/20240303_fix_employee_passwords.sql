-- Verificar la estructura de la tabla employees
DO $$
BEGIN
    -- Verificar si la columna password existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'password'
    ) THEN
        -- Agregar la columna password si no existe
        ALTER TABLE employees ADD COLUMN password TEXT;
    END IF;
    
    -- Asegurarse de que todos los empleados tengan una contraseña
    UPDATE employees
    SET password = 'password123'
    WHERE password IS NULL OR password = '';
    
    -- Verificar si hay empleados sin ID de autenticación
    -- Nota: Solo verificamos IS NULL ya que '' no es válido para UUID
    IF EXISTS (
        SELECT 1
        FROM employees
        WHERE id IS NULL
    ) THEN
        RAISE NOTICE 'Hay empleados sin ID de autenticación. Estos necesitarán ser actualizados manualmente.';
    END IF;
END $$;

-- Mostrar los empleados para verificación
SELECT id, email, role, password, name
FROM employees
ORDER BY email;


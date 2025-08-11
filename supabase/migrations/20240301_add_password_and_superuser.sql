-- 1. Agregar campo de contraseña a la tabla de empleados si no existe
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Verificar si el superusuario ya existe
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM employees WHERE email = 'f.correak@cloudhub.cl'
    ) INTO user_exists;
    
    -- Si el superusuario no existe, crearlo
    IF NOT user_exists THEN
        -- Crear el establecimiento principal si no existe
        INSERT INTO establishments (name, address, city, country)
        VALUES ('Establecimiento Principal', 'Dirección Principal', 'Santiago', 'Chile')
        ON CONFLICT DO NOTHING
        RETURNING id;
        
        -- Crear el superusuario
        INSERT INTO employees (
            name,
            email,
            role,
            status,
            password,
            establishment_id
        )
        VALUES (
            'Administrador Principal',
            'f.correak@cloudhub.cl',
            'superadmin',
            'Activo',
            'zealot15$',
            (SELECT id FROM establishments LIMIT 1)
        );
        
        -- Mensaje de confirmación
        RAISE NOTICE 'Superusuario creado exitosamente';
    ELSE
        -- Actualizar la contraseña del superusuario existente
        UPDATE employees
        SET 
            role = 'superadmin',
            status = 'Activo',
            password = 'zealot15$'
        WHERE email = 'f.correak@cloudhub.cl';
        
        -- Mensaje de confirmación
        RAISE NOTICE 'Superusuario actualizado exitosamente';
    END IF;
END
$$;

-- 3. Crear usuario en auth.users si no existe
-- Nota: Esto requiere permisos de superusuario en Supabase
-- Esta parte debe hacerse manualmente en la interfaz de Supabase o mediante una función RPC


-- Script para verificar y actualizar el tipo enum employee_role
DO $$
BEGIN
    -- Verificar si el tipo enum ya existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_role') THEN
        -- Crear el tipo enum si no existe con todos los valores necesarios
        CREATE TYPE employee_role AS ENUM ('guardia', 'admin', 'superadmin');
    ELSE
        -- Verificar y añadir cada valor si no existe
        -- Añadir 'superadmin' si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'employee_role')
            AND enumlabel = 'superadmin'
        ) THEN
            ALTER TYPE employee_role ADD VALUE 'superadmin';
        END IF;
        
        -- Añadir 'admin' si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'employee_role')
            AND enumlabel = 'admin'
        ) THEN
            ALTER TYPE employee_role ADD VALUE 'admin';
        END IF;
        
        -- Añadir 'guardia' si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'employee_role')
            AND enumlabel = 'guardia'
        ) THEN
            ALTER TYPE employee_role ADD VALUE 'guardia';
        END IF;
    END IF;
END
$$;

-- Mostrar los valores actuales del enum para verificación
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'employee_role')
ORDER BY enumsortorder;


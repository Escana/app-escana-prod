-- Verificar y corregir los IDs de los empleados
DO $$
DECLARE
    emp RECORD;
    new_id UUID;
BEGIN
    -- Recorrer todos los empleados sin ID válido
    FOR emp IN 
        SELECT * FROM employees 
        WHERE id IS NULL
    LOOP
        -- Generar un nuevo UUID
        new_id := gen_random_uuid();
        
        -- Actualizar el empleado con el nuevo ID
        UPDATE employees
        SET id = new_id
        WHERE email = emp.email AND id IS NULL;
        
        RAISE NOTICE 'Actualizado empleado % con nuevo ID: %', emp.email, new_id;
    END LOOP;
END $$;

-- Mostrar los empleados actualizados
SELECT id, email, role, password, name
FROM employees
ORDER BY email;


-- Verificar si ya existe un usuario de prueba
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM employees WHERE email = 'admin@example.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Crear un usuario de prueba con rol de superadmin
        INSERT INTO employees (id, email, password, name, role, status)
        VALUES (
            gen_random_uuid(),
            'admin@example.com',
            'admin123',
            'Administrador de Prueba',
            'superadmin',
            'Activo'
        );
        
        RAISE NOTICE 'Usuario de prueba creado: admin@example.com / admin123';
    ELSE
        -- Actualizar la contraseña del usuario existente
        UPDATE employees
        SET password = 'admin123',
            role = 'superadmin',
            status = 'Activo'
        WHERE email = 'admin@example.com';
        
        RAISE NOTICE 'Usuario de prueba actualizado: admin@example.com / admin123';
    END IF;
END $$;

-- Mostrar los usuarios disponibles
SELECT id, email, password, role, name, status FROM employees;


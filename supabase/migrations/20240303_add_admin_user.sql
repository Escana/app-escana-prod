-- Agregar un superusuario con una contraseña conocida
DO $$
BEGIN
    -- Verificar si ya existe un superusuario con el email admin@example.com
    IF NOT EXISTS (
        SELECT 1
        FROM employees
        WHERE email = 'admin@example.com'
    ) THEN
        -- Insertar el superusuario
        INSERT INTO employees (id, email, role, password, name)
        VALUES (
            gen_random_uuid(),
            'admin@example.com',
            'superadmin',
            'admin123',
            'Administrador'
        );
        RAISE NOTICE 'Superusuario creado con éxito.';
    ELSE
        -- Actualizar la contraseña del superusuario existente
        UPDATE employees
        SET 
            password = 'admin123',
            role = 'superadmin'
        WHERE 
            email = 'admin@example.com';
        RAISE NOTICE 'Contraseña del superusuario actualizada.';
    END IF;
END $$;

-- Mostrar el superusuario
SELECT id, email, role, password, name
FROM employees
WHERE email = 'admin@example.com';


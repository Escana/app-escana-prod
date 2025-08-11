-- Verificar si existe el usuario de prueba
DO $$
BEGIN
    -- Verificar si existe el usuario admin
    IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'admin@example.com') THEN
        -- Crear usuario admin
        INSERT INTO employees (email, password, name, role)
        VALUES ('admin@example.com', 'admin123', 'Administrador', 'admin');
    ELSE
        -- Actualizar contraseña del usuario admin
        UPDATE employees
        SET password = 'admin123'
        WHERE email = 'admin@example.com';
    END IF;

    -- Verificar si existe el usuario de prueba
    IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'f.correak@cloudhub.cl') THEN
        -- Crear usuario de prueba
        INSERT INTO employees (email, password, name, role)
        VALUES ('f.correak@cloudhub.cl', 'password123', 'Felipe Correa', 'admin');
    ELSE
        -- Actualizar contraseña del usuario de prueba
        UPDATE employees
        SET password = 'password123'
        WHERE email = 'f.correak@cloudhub.cl';
    END IF;
END $$;


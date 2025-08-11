-- Limpiar espacios en blanco en las contraseñas
UPDATE employees
SET password = TRIM(password)
WHERE password IS NOT NULL;

-- Mostrar los empleados para verificación
SELECT id, email, role, password, name, 
       LENGTH(password) AS password_length,
       CASE 
         WHEN password LIKE ' %' THEN 'Tiene espacios al inicio'
         WHEN password LIKE '% ' THEN 'Tiene espacios al final'
         ELSE 'Sin espacios'
       END AS espacios
FROM employees
ORDER BY email;

-- Crear un usuario de prueba con contraseña conocida
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM employees WHERE email = 'test@example.com') THEN
        UPDATE employees 
        SET password = 'test123', 
            role = 'admin'
        WHERE email = 'test@example.com';
    ELSE
        INSERT INTO employees (email, password, name, role)
        VALUES ('test@example.com', 'test123', 'Usuario de Prueba', 'admin');
    END IF;
END $$;

-- Mostrar el usuario de prueba
SELECT id, email, password, role, name
FROM employees
WHERE email = 'test@example.com';


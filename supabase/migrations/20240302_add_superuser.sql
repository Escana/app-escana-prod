-- Crear tabla health_check para verificar la conexión
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar un registro en health_check si no existe ninguno
INSERT INTO health_check (status)
SELECT 'ok'
WHERE NOT EXISTS (SELECT 1 FROM health_check);

-- Verificar si el superusuario ya existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'f.correak@cloudhub.cl') THEN
    -- Crear el superusuario
    INSERT INTO employees (
      email, 
      password, 
      role, 
      name, 
      created_at, 
      last_login
    ) VALUES (
      'f.correak@cloudhub.cl',
      'zealot15$',
      'superadmin',
      'Felipe Correa',
      NOW(),
      NULL
    );
    
    RAISE NOTICE 'Superusuario creado correctamente';
  ELSE
    -- Actualizar la contraseña si el usuario ya existe
    UPDATE employees 
    SET 
      password = 'zealot15$',
      role = 'superadmin'
    WHERE email = 'f.correak@cloudhub.cl';
    
    RAISE NOTICE 'Contraseña de superusuario actualizada';
  END IF;
END $$;


-- Verificar que la tabla establishments tenga la estructura correcta
DO $$
BEGIN
  -- Verificar que la columna id sea de tipo UUID
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'establishments' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    RAISE NOTICE 'La columna id de la tabla establishments no es de tipo UUID';
  END IF;
  
  -- Verificar que la tabla tenga la restricción de clave primaria
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'establishments'
    AND constraint_type = 'PRIMARY KEY'
  ) THEN
    RAISE NOTICE 'La tabla establishments no tiene una clave primaria definida';
  END IF;
  
  -- Verificar que exista el trigger para actualizar timestamps
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_table = 'establishments'
    AND trigger_name = 'update_establishments_timestamp'
  ) THEN
    RAISE NOTICE 'El trigger update_establishments_timestamp no existe en la tabla establishments';
  END IF;
END $$;

-- Insertar un establecimiento de prueba si no existe ninguno
INSERT INTO establishments (name, address, city, country, status, plan)
SELECT 'Establecimiento Demo', 'Dirección Demo 123', 'Santiago', 'Chile', 'active', 'basic'
WHERE NOT EXISTS (SELECT 1 FROM establishments LIMIT 1);

-- Mostrar los establecimientos existentes con sus IDs para referencia
SELECT id, name, city FROM establishments ORDER BY name;


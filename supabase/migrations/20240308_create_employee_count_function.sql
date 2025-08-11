-- Crear una función para obtener el conteo de empleados por establecimiento
CREATE OR REPLACE FUNCTION get_employee_counts_by_establishment()
RETURNS TABLE (establishment_id UUID, count BIGINT) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    establishment_id, 
    COUNT(*) as count
  FROM 
    employees
  WHERE 
    establishment_id IS NOT NULL
  GROUP BY 
    establishment_id;
$$;

-- Otorgar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION get_employee_counts_by_establishment() TO authenticated;
GRANT EXECUTE ON FUNCTION get_employee_counts_by_establishment() TO anon;
GRANT EXECUTE ON FUNCTION get_employee_counts_by_establishment() TO service_role;


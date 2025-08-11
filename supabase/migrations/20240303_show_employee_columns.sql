-- Mostrar las columnas existentes en la tabla employees
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'employees'
ORDER BY 
    ordinal_position;

-- Mostrar un ejemplo de los datos
SELECT *
FROM employees
LIMIT 5;


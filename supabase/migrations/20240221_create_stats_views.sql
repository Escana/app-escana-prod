-- Crear vistas para estadísticas
CREATE OR REPLACE VIEW stats_visits_by_gender AS
SELECT
    date_trunc('day', visits.created_at) as date,
    clients.gender,
    COUNT(*) as count
FROM visits
JOIN clients ON visits.client_id = clients.id
GROUP BY date_trunc('day', visits.created_at), clients.gender;

CREATE OR REPLACE VIEW stats_visits_by_age AS
SELECT
    date_trunc('day', visits.created_at) as date,
    clients.gender,
    CASE 
        WHEN age < 26 THEN '18-25'
        WHEN age < 36 THEN '26-35'
        WHEN age < 46 THEN '36-45'
        WHEN age < 56 THEN '46-55'
        ELSE '56+'
    END as age_range,
    COUNT(*) as count
FROM visits
JOIN clients ON visits.client_id = clients.id
GROUP BY 
    date_trunc('day', visits.created_at),
    clients.gender,
    CASE 
        WHEN age < 26 THEN '18-25'
        WHEN age < 36 THEN '26-35'
        WHEN age < 46 THEN '36-45'
        WHEN age < 56 THEN '46-55'
        ELSE '56+'
    END;

CREATE OR REPLACE VIEW stats_visits_by_nationality AS
SELECT
    date_trunc('day', visits.created_at) as date,
    CASE 
        WHEN clients.nationality = 'CL' THEN 'chilean'
        ELSE 'foreign'
    END as nationality_type,
    COUNT(*) as count
FROM visits
JOIN clients ON visits.client_id = clients.id
GROUP BY 
    date_trunc('day', visits.created_at),
    CASE 
        WHEN clients.nationality = 'CL' THEN 'chilean'
        ELSE 'foreign'
    END;

CREATE OR REPLACE VIEW stats_incidents_summary AS
SELECT
    date_trunc('day', incidents.created_at) as date,
    COUNT(*) as total_incidents,
    SUM(CASE WHEN severity >= 4 THEN 1 ELSE 0 END) as severe_incidents,
    COUNT(DISTINCT client_id) as unique_clients
FROM incidents
GROUP BY date_trunc('day', incidents.created_at);

-- Función para obtener estadísticas por período
CREATE OR REPLACE FUNCTION get_stats(
    p_start_date timestamp,
    p_end_date timestamp
) RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    WITH period_stats AS (
        -- Estadísticas de visitas por género
        SELECT
            json_build_object(
                'female', (
                    SELECT json_build_object(
                        'count', COALESCE(SUM(count), 0),
                        'change', COALESCE(
                            ROUND(
                                ((SUM(count)::float / NULLIF(LAG(SUM(count)) OVER (ORDER BY date), 0)) - 1) * 100,
                                1
                            )::text || '%',
                            '0%'
                        )
                    )
                    FROM stats_visits_by_gender
                    WHERE gender = 'F'
                    AND date BETWEEN p_start_date AND p_end_date
                ),
                'male', (
                    SELECT json_build_object(
                        'count', COALESCE(SUM(count), 0),
                        'change', COALESCE(
                            ROUND(
                                ((SUM(count)::float / NULLIF(LAG(SUM(count)) OVER (ORDER BY date), 0)) - 1) * 100,
                                1
                            )::text || '%',
                            '0%'
                        )
                    )
                    FROM stats_visits_by_gender
                    WHERE gender = 'M'
                    AND date BETWEEN p_start_date AND p_end_date
                )
            ) as attendance_data,
            
            -- Estadísticas de incidentes
            (
                SELECT json_build_object(
                    'total', json_build_object(
                        'count', COALESCE(SUM(total_incidents), 0),
                        'change', COALESCE(
                            ROUND(
                                ((SUM(total_incidents)::float / NULLIF(LAG(SUM(total_incidents)) OVER (ORDER BY date), 0)) - 1) * 100,
                                1
                            )::text || '%',
                            '0%'
                        )
                    ),
                    'bans', json_build_object(
                        'count', COALESCE(SUM(severe_incidents), 0),
                        'change', COALESCE(
                            ROUND(
                                ((SUM(severe_incidents)::float / NULLIF(LAG(SUM(severe_incidents)) OVER (ORDER BY date), 0)) - 1) * 100,
                                1
                            )::text || '%',
                            '0%'
                        )
                    )
                )
                FROM stats_incidents_summary
                WHERE date BETWEEN p_start_date AND p_end_date
            ) as incidents_data,
            
            -- Estadísticas de nacionalidad
            json_build_object(
                'chilean', COALESCE((
                    SELECT SUM(count)
                    FROM stats_visits_by_nationality
                    WHERE nationality_type = 'chilean'
                    AND date BETWEEN p_start_date AND p_end_date
                ), 0),
                'foreign', COALESCE((
                    SELECT SUM(count)
                    FROM stats_visits_by_nationality
                    WHERE nationality_type = 'foreign'
                    AND date BETWEEN p_start_date AND p_end_date
                ), 0)
            ) as nationality_data
    )
    SELECT json_build_object(
        'stats', row_to_json(period_stats)
    )
    INTO result
    FROM period_stats;

    RETURN result;
END;
$$;


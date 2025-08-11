-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS create_visit;

-- Create the function with exact parameter names and types
CREATE OR REPLACE FUNCTION public.create_visit(
  p_client_id UUID,
  p_entry_time TIMESTAMPTZ DEFAULT NOW()
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_visit_id UUID;
BEGIN
  -- Insert with explicit schema reference
  INSERT INTO public.visits (
    client_id,
    entry_time,
    created_at,
    updated_at
  ) VALUES (
    p_client_id,
    p_entry_time,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_visit_id;

  -- Update stats with explicit schema reference
  INSERT INTO public.stats (
    date,
    total_visits,
    male_visits,
    female_visits
  )
  VALUES (
    CURRENT_DATE,
    1,
    CASE WHEN (SELECT sexo FROM public.clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
    CASE WHEN (SELECT sexo FROM public.clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_visits = public.stats.total_visits + 1,
    male_visits = public.stats.male_visits + 
      CASE WHEN (SELECT sexo FROM public.clients WHERE id = p_client_id) = 'M' THEN 1 ELSE 0 END,
    female_visits = public.stats.female_visits + 
      CASE WHEN (SELECT sexo FROM public.clients WHERE id = p_client_id) = 'F' THEN 1 ELSE 0 END;

  RETURN v_visit_id;
END;
$$;

-- Reset function privileges
REVOKE ALL ON FUNCTION public.create_visit FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_visit TO authenticated;

-- Notify the schema change
NOTIFY pgrst, 'reload schema';


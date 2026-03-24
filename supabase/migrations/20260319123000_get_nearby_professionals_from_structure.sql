CREATE OR REPLACE FUNCTION public.get_nearby_professionals_from_structure(
    p_structure_id UUID
)
RETURNS TABLE (
    user_id UUID,
    city TEXT,
    hourly_rate NUMERIC,
    is_available BOOLEAN,
    distance_km NUMERIC,
    is_default_case BOOLEAN
)
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
    structure_point geography;
    structure_location_was_null BOOLEAN := false;

--Fallback: center of Paris (used if the structure has no position)

    fallback_point geography :=
        ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography;

BEGIN
    SELECT s.location
    INTO structure_point
    FROM public.structures s
    WHERE s.user_id = p_structure_id;

    -- If no position → use Paris
    IF structure_point IS NULL THEN
        structure_point := fallback_point;
        structure_location_was_null := true;
    END IF;

    RETURN QUERY
    SELECT
        p.user_id,
        p.city,
        p.hourly_rate,
        p.is_available,
        CASE
            WHEN p.location IS NULL THEN NULL
            ELSE ROUND((ST_Distance(p.location, structure_point) / 1000)::NUMERIC, 2)
        END AS distance_km,
        structure_location_was_null AS is_default_case
    FROM public.professionals p
    WHERE p.is_available = true
    ORDER BY
        CASE WHEN p.location IS NULL THEN 1 ELSE 0 END,
        ST_Distance(p.location, structure_point);
END;
$$;

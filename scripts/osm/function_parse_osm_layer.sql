CREATE OR REPLACE FUNCTION parse_osm_layer (osm_layer TEXT, osm_level TEXT )
  RETURNS INTEGER
LANGUAGE 'plpgsql'
IMMUTABLE
PARALLEL SAFE
AS
$function$
DECLARE
  res INTEGER;
  matches INTEGER[];
  min_layer INTEGER;
  max_layer INTEGER;
BEGIN

  SELECT INTO matches
    array_agg(r[1]::INTEGER)
  FROM
    regexp_matches(COALESCE(osm_layer, osm_level),'-?\d+', 'g') r;

  CASE
    WHEN matches IS NULL THEN res := 0;
    WHEN array_length(matches, 1) = 0 THEN res := 0;
    WHEN array_length(matches, 1) = 1 THEN res := matches[1];
    WHEN array_length(matches, 1) > 1 THEN
      SELECT INTO max_layer, min_layer max(x), min(x) FROM unnest(matches) x;
      CASE
        WHEN max_layer = min_layer THEN res := max_layer;
        WHEN min_layer >= 0 THEN res := max_layer;
        WHEN max_layer <= 0 THEN res := min_layer;
        ELSE res := 0;
      END CASE;
  END CASE;

  RETURN res;

END;
$function$
;

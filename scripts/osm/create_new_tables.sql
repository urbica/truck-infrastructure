DROP TABLE IF EXISTS newer.truck_restrictions;
CREATE TABLE newer.truck_restrictions AS
SELECT
		'way/' || osm_id::TEXT AS osm_id,
		tags->'highway' AS highway,
		tags->'maxheight' AS maxheight,
		tags->'maxweight' AS maxweight,
		tags->'hgv' AS hgv,
		way AS geom
FROM
	public.osm_line
WHERE
		tags?'maxheight'
	 OR tags?'maxweight'
	 OR tags->'hgv'='no'
;
CREATE INDEX idx_truck_restrictions_geom ON newer.truck_restrictions USING GIST (geom);
ANALYSE newer.truck_restrictions;

DROP TABLE IF EXISTS newer.truck_restrictions_pnt;
CREATE TABLE newer.truck_restrictions_pnt AS
SELECT
		'node/' || osm_id::TEXT AS osm_id,
		tags->'highway' AS highway,
		tags->'maxheight' AS maxheight,
		tags->'maxweight' AS maxweight,
		tags->'hgv' AS hgv,
		way AS geom
FROM
	public.osm_point
WHERE
		tags?'maxheight'
	 OR tags?'maxweight'
	 OR tags->'hgv'='no'
;
CREATE INDEX idx_truck_restrictions_pnt_geom ON newer.truck_restrictions_pnt USING GIST (geom);
ANALYSE newer.truck_restrictions_pnt;

DROP TABLE IF EXISTS newer.bridges;
CREATE TABLE newer.bridges AS
SELECT
		'way/' || osm_id::TEXT AS osm_id,
		tags->'highway' AS highway,
		tags->'maxheight' AS maxheight,
		tags->'maxweight' AS maxweight,
		tags->'hgv' AS hgv,
		tags->'bridge' AS bridge,
		tags->'layer' AS layer,
		tags->'level' AS level,
		way AS geom
FROM osm_line
WHERE
	(
		tags->'bridge'='yes'
		OR
		util.parse_osm_layer(tags->'layer', tags->'level') > 1
	)
	AND tags->'highway' NOT IN ('footway', 'path', 'proposed')
;
CREATE INDEX idx_bridges_geom ON newer.bridges USING GIST(geom);
ANALYSE newer.bridges;

DROP TABLE IF EXISTS newer.under_bridges;
CREATE TABLE newer.under_bridges AS
SELECT DISTINCT ON (l.osm_id)
		'way/' || l.osm_id::TEXT AS osm_id,
		l.tags->'highway' AS highway,
		coalesce(l.tags->'maxheight', l.tags->'maxheight:legal', l.tags->'maxheight:physical')  AS maxheight,
		l.tags->'maxweight' AS maxweight,
		l.tags->'hgv' AS hgv,
		l.tags->'tunnel' AS tunnel,
		l.tags->'layer' AS layer,
		l.tags->'level' AS level,
		l.way AS geom
FROM
	osm_line l,
	bridges b
WHERE
		('way/' || l.osm_id::TEXT) != b.osm_id
	AND st_intersects(l.way, b.geom)
	AND (NOT st_touches(l.way, b.geom))
	AND l.tags->'highway' NOT IN ('footway', 'path', 'proposed', 'escalator', 'cycleway', 'construction', 'elevator', 'steps', 'raceway', 'bridleway')
;
CREATE INDEX idx_under_bridges_geom ON newer.under_bridges USING GIST(geom);
ANALYSE newer.under_bridges;

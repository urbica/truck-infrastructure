#!/usr/bin/env bash

echo ${POSTGRES_HOST}:${POSTGRES_PORT}:${POSTGRES_DB}:${POSTGRES_USER}:${POSTGRES_PASSWORD} > /.pgpass
chmod 600 /.pgpass
export PGPASSFILE='/.pgpass'

echo "Renaming ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT} to ${OSM_DATA_PATH}/${OSM_PLANET_PREVIOUS} ..."
mv ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT} ${OSM_DATA_PATH}/${OSM_PLANET_PREVIOUS}
echo "Renamed"

echo "Renaming ${OSM_DATA_PATH}/${OSM_PLANET_DIFF} to ${OSM_DATA_PATH}/${OSM_PLANET_DIFF_PREVIOUS} ..."
mv ${OSM_DATA_PATH}/${OSM_PLANET_DIFF} ${OSM_DATA_PATH}/${OSM_PLANET_DIFF_PREVIOUS}
echo "Renamed"

echo "Updating ${OSM_DATA_PATH}/${OSM_PLANET_DIFF} to ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT} ..."
osmupdate -v ${OSM_DATA_PATH}/${OSM_PLANET_PREVIOUS} ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT}
echo "Fetched"

#echo "Applying ${OSM_DATA_PATH}/${OSM_PLANET_DIFF} to ${OSM_DATA_PATH}/${OSM_PLANET_PREVIOUS} ..."
#osmium apply-changes -v -o ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT} ${OSM_DATA_PATH}/${OSM_PLANET_PREVIOUS} ${OSM_DATA_PATH}/${OSM_PLANET_DIFF}
#echo "Applied"

echo "Extracting ${OSM_DATA_PATH}/${OSM_USA} from ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT} ..."
osmium extract -v --overwrite -s smart -p ${OSMIUM_BOUNDARY_PATH}/${OSMIUM_BOUNDARY_FILE} -o ${OSM_DATA_PATH}/${OSM_USA} ${OSM_DATA_PATH}/${OSM_PLANET_CURRENT}
echo "Extracted"

echo "Filtering ${OSM_DATA_PATH}/${OSM_USA} by tags ${OSM_TAGS_TO_FILTER} ..."
osmium tags-filter -v -o ${OSM_DATA_PATH}/${OSM_USA_FILTERED} ${OSM_DATA_PATH}/${OSM_USA} /highway /bridge /maxheight /maxweight /hgv
echo "Filtered"

echo "Importing ${OSM_DATA_PATH}/${OSM_USA_FILTERED} to database ${POSTGRES_DB} ..."
osm2pgsql --create --database ${POSTGRES_DB} --merc --slim --style ${OSM2PGSQL_STYLE_PATH}/${OSM2PGSQL_STYLE} --cache ${OSM2PGSQL_CACHE_SIZE} --username ${POSTGRES_USER} --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --extra-attributes --hstore-all --multi-geometry --verbose --prefix ${OSM2PGSQL_PREFIX} ${OSM_DATA_PATH}/${OSM_USA_FILTERED}
echo "Imported"

echo "Deleting ${OSM_DATA_PATH}/${OSM_USA_PREVIOUS} ..."
rm -f ${OSM_DATA_PATH}/${OSM_USA_PREVIOUS}
echo "Deleted"

echo "Deleting ${OSM_DATA_PATH}/${OSM_USA_FILTERED_PREVIOUS} ..."
rm -f ${OSM_DATA_PATH}/${OSM_USA_FILTERED_PREVIOUS}
echo "Deleted"

echo "Renaming ${OSM_DATA_PATH}/${OSM_USA} to ${OSM_DATA_PATH}/${OSM_USA_PREVIOUS} ..."
mv ${OSM_DATA_PATH}/${OSM_USA} ${OSM_DATA_PATH}/${OSM_USA_PREVIOUS}
echo "Renamed"

echo "Renaming ${OSM_DATA_PATH}/${OSM_USA_FILTERED} to ${OSM_DATA_PATH}/${OSM_USA_FILTERED_PREVIOUS} ..."
mv ${OSM_DATA_PATH}/${OSM_USA_FILTERED} ${OSM_DATA_PATH}/${OSM_USA_FILTERED_PREVIOUS}
echo "Renamed"

echo "Finished updating"

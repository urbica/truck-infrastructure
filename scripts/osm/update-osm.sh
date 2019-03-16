#!/usr/bin/env bash

echo ${POSTGRES_HOST}:${POSTGRES_PORT}:${POSTGRES_DB}:${POSTGRES_USER}:${POSTGRES_PASSWORD} > /.pgpass
chmod 600 /.pgpass
export PGPASSFILE='/.pgpass'

echo 'Updating local OSM extract...'
osmupdate -v ${OSM_DATA_PATH}/${OSM_CURRENT} ${OSM_DATA_PATH}/${OSM_NEXT}
echo 'Updated'

echo 'Extracting from updated OSM extract...'
osmium extract -v --overwrite -s smart -p ${OSM_DATA_PATH}/${OSMIUM_BOUNDARY_FILE} -o ${OSM_DATA_PATH}/${OSM_NEXT_CUT} ${OSM_DATA_PATH}/${OSM_NEXT}
echo 'Extracted'

echo 'Filtering OSM extract by tags'
osmium tags-filter -v -o ${OSM_DATA_PATH}/${OSM_NEXT_CUT_FILTERED} ${OSM_DATA_PATH}/${OSM_NEXT_CUT} /highway /bridge /maxheight /maxweight /hgv
echo 'Filtered'

echo 'Creating a diff file from new extract and old extract'
osmium derive-changes -v --overwrite ${OSM_DATA_PATH}/${OSM_EXTRACT_FILE} ${OSM_DATA_PATH}/${OSM_EXTRACT_NEXT_FILE_CUT} -o ${OSM_DATA_PATH}/${OSM_CHANGES_FILE}
echo 'Created a diff file'

echo 'Updating database with diff file'
osm2pgsql --append --database ${POSTGRES_DB} --merc --slim --style ${OSM_SH_PATH}/${OSM2PGSQL_STYLE} --cache ${OSM2PGSQL_CACHE_SIZE} --username ${POSTGRES_USER} --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --extra-attributes --hstore-all --multi-geometry --verbose --prefix ${OSM2PGSQL_PREFIX} ${OSM_DATA_PATH}/${OSM_CHANGES_FILE}
echo 'Database updated'

echo 'Reindexing OSM tables...'
psql --echo-all -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -d ${POSTGRES_DB} -U ${POSTGRES_USER} -f $OSM_SQL_PATH/reindex_osm_tables.sql
echo 'Reindexed'

echo 'adding new record to calendar...'
psql --echo-all -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -d ${POSTGRES_DB} -U ${POSTGRES_USER} -f $OSM_SQL_PATH/add_to_calendar.sql
echo 'added'

echo 'refreshing MGK matviews...'
psql --echo-all -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -d ${POSTGRES_DB} -U ${POSTGRES_USER} -f $OSM_SQL_PATH/refresh_matviews.sql
echo 'refreshed'

echo 'updating calendar...'
psql --echo-all -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -d ${POSTGRES_DB} -U ${POSTGRES_USER} -f $OSM_SQL_PATH/update_calendar.sql
echo 'updated'

echo 'cleanup...'
mv ${OSM_DATA_PATH}/${OSM_EXTRACT_FILE} ${OSM_DATA_PATH}/${OSM_EXTRACT_PREVIOUS_FILE}
mv ${OSM_DATA_PATH}/${OSM_EXTRACT_NEXT_FILE_CUT} ${OSM_DATA_PATH}/${OSM_EXTRACT_FILE}
mv ${OSM_DATA_PATH}/${OSM_CHANGES_FILE} ${OSM_DATA_PATH}/${OSM_CHANGES_PREVIOUS_FILE}
rm ${OSM_DATA_PATH}/${OSM_EXTRACT_NEXT_FILE}
echo 'cleaned'

echo 'OSM import finished'

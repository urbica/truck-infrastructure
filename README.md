Start truck routing QA tool with:

```
#Clone this repo
git clone https://github.com/urbica/truck-infrastructure.git
cd truck-infrastructure

#Download OSM data
mkdir -p data/osm
wget -O data/osm/planet-latest.osm.pbf https://planet.osm.org/pbf/planet-latest.osm.pbf

#Setup ENV variables
cp example.env .env

#Setup cron logging
mkdir -p data/cron
touch data/cron/cron.log
chown root:root data/cron/cron.log

#First run manually
docker-compose run --rm truck-osm /scripts/update-osm.sh

#Then bring all containers up
docker-compose up -d --force-recreate
```

The tool should be available on port 80 of the host machine.

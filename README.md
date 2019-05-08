```
cp example.env .env
mkdir -p data/cron
touch data/cron/cron.log
chown root:root data/cron/cron.log
wget -O data/osm/planet-latest.osm.pbf wget https://planet.osm.org/pbf/planet-latest.osm.pbf
docker-compose run --rm 
docker-compose up -d --force-recreate
```

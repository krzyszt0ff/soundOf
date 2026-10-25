CREATE EXTENSION IF NOT EXISTS postgis;

CREATE INDEX "Pin_geom_idx" ON "Pin"
USING GIST (ST_SetSRID(ST_MakePoint("lon", "lat"), 4326));
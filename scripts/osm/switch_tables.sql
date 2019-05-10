CREATE SCHEMA IF NOT EXISTS bak;

BEGIN TRANSACTION;

DROP TABLE IF EXISTS bak.truck_restrictions;
ALTER TABLE IF EXISTS public.truck_restrictions SET SCHEMA bak;
ALTER TABLE newer.truck_restrictions SET SCHEMA public;

DROP TABLE IF EXISTS bak.truck_restrictions_pnt;
ALTER TABLE IF EXISTS public.truck_restrictions_pnt SET SCHEMA bak;
ALTER TABLE newer.truck_restrictions_pnt SET SCHEMA public;

DROP TABLE IF EXISTS bak.bridges;
ALTER TABLE IF EXISTS public.bridges SET SCHEMA bak;
ALTER TABLE newer.bridges SET SCHEMA public;

DROP TABLE IF EXISTS bak.under_bridges;
ALTER TABLE IF EXISTS public.under_bridges SET SCHEMA bak;
ALTER TABLE newer.under_bridges SET SCHEMA public;

DROP TABLE IF EXISTS bak.statistics;
ALTER TABLE IF EXISTS public.statistics SET SCHEMA bak;
ALTER TABLE newer.statistics SET SCHEMA public;

END TRANSACTION;

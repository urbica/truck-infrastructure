BEGIN TRANSACTION;

DROP TABLE IF EXISTS bak.truck_restrictions;
ALTER TABLE public.truck_restrictions SET SCHEMA bak;
ALTER TABLE newer.truck_restrictions SET SCHEMA public;

DROP TABLE IF EXISTS bak.truck_restrictions_pnt;
ALTER TABLE public.truck_restrictions_pnt SET SCHEMA bak;
ALTER TABLE newer.truck_restrictions_pnt SET SCHEMA public;

DROP TABLE IF EXISTS bak.bridges;
ALTER TABLE public.bridges SET SCHEMA bak;
ALTER TABLE newer.bridges SET SCHEMA public;

DROP TABLE IF EXISTS bak.under_bridges;
ALTER TABLE public.under_bridges SET SCHEMA bak;
ALTER TABLE newer.under_bridges SET SCHEMA public;

END TRANSACTION;

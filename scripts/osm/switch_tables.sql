BEGIN TRANSACTION;

ALTER TABLE truck_restrictions RENAME TO truck_restrictions_bak;
ALTER TABLE truck_restrictions_new RENAME TO truck_restrictions;

ALTER TABLE truck_restrictions_pnt RENAME TO truck_restrictions_pnt_bak;
ALTER TABLE truck_restrictions_pnt_new RENAME TO truck_restrictions_pnt;

ALTER TABLE bridges RENAME TO bridges_bak;
ALTER TABLE bridges_new RENAME TO bridges;

ALTER TABLE under_bridges RENAME TO under_bridges_bak;
ALTER TABLE under_bridges_new RENAME TO under_bridges;

END TRANSACTION;

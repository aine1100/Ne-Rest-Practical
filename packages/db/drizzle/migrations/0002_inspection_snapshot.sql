ALTER TABLE inspection.inspections ADD COLUMN IF NOT EXISTS status_before varchar(20);
ALTER TABLE inspection.inspections ADD COLUMN IF NOT EXISTS status_after varchar(20);

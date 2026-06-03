ALTER TABLE inspection.inspections ALTER COLUMN inspector_id DROP NOT NULL;
ALTER TABLE inspection.inspections ALTER COLUMN inspection_date DROP NOT NULL;
ALTER TABLE inspection.inspections ALTER COLUMN inspection_time DROP NOT NULL;
ALTER TABLE inspection.inspections ADD COLUMN IF NOT EXISTS findings text;
ALTER TABLE inspection.inspections ALTER COLUMN status SET DEFAULT 'Requested';

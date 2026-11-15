ALTER TABLE projects ADD COLUMN project_type TEXT NOT NULL DEFAULT 'general';

UPDATE projects
SET project_type = 'dream'
WHERE trim(coalesce(period, '')) <> ''
  AND trim(period) NOT LIKE '20%/%';

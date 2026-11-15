ALTER TABLE international_conferences ADD COLUMN visibility TEXT NOT NULL DEFAULT 'draft';

UPDATE international_conferences
SET visibility = 'published'
WHERE is_published = 1;

ALTER TABLE journal_papers ADD COLUMN is_scie INTEGER NOT NULL DEFAULT 0;
ALTER TABLE journal_papers ADD COLUMN is_ei INTEGER NOT NULL DEFAULT 0;

UPDATE journal_papers
SET is_scie = 1
WHERE upper(trim(coalesce(index_type, ''))) = 'SCIE';

UPDATE journal_papers
SET is_ei = 1
WHERE upper(trim(coalesce(index_type, ''))) = 'EI';

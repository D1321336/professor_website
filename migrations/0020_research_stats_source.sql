ALTER TABLE research_stats ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';

UPDATE research_stats
SET source = CASE label
  WHEN '期刊論文' THEN 'journal_count'
  WHEN '研討會論文' THEN 'conference_count'
  WHEN '發明專利' THEN 'invention_patent_count'
  WHEN '主持計畫' THEN 'project_count'
  ELSE 'manual'
END
WHERE label IN ('期刊論文', '研討會論文', '發明專利', '主持計畫');

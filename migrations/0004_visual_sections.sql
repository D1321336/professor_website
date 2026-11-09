ALTER TABLE research ADD COLUMN basin_location TEXT;
ALTER TABLE research ADD COLUMN representative_outcome TEXT;
UPDATE research SET basin_location = CASE id WHEN 1 THEN '水庫' WHEN 2 THEN '河道' WHEN 3 THEN '下游與都市' WHEN 4 THEN '集水區' WHEN 5 THEN '下游與都市' END;

ALTER TABLE journal_papers ADD COLUMN index_type TEXT;
ALTER TABLE journal_papers ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE journal_papers ADD COLUMN graphical_abstract TEXT;
UPDATE journal_papers SET is_featured = 1 WHERE id IN (1, 2, 3);

ALTER TABLE projects ADD COLUMN start_date TEXT;
ALTER TABLE projects ADD COLUMN end_date TEXT;
ALTER TABLE projects ADD COLUMN status_override TEXT;
ALTER TABLE projects ADD COLUMN funding_category TEXT;
ALTER TABLE projects ADD COLUMN summary TEXT;
ALTER TABLE projects ADD COLUMN research_location TEXT;
ALTER TABLE projects ADD COLUMN outcome_url TEXT;
UPDATE projects SET start_date = replace(substr(period,1,7), '/', '-') || '-01', end_date = replace(substr(period,9,7), '/', '-') || '-28' WHERE period GLOB '20??/??-20??/??';
UPDATE projects SET funding_category = CASE
  WHEN organization LIKE '%國科會%' THEN '國科會'
  WHEN organization LIKE '%農村%' THEN '農村水保署'
  WHEN organization LIKE '%水利%' THEN '水利署'
  WHEN organization LIKE '%教育部%' THEN '教育部'
  ELSE '民間' END;

ALTER TABLE international_items ADD COLUMN country TEXT;
ALTER TABLE international_items ADD COLUMN city TEXT;
ALTER TABLE international_items ADD COLUMN organization TEXT;
ALTER TABLE international_items ADD COLUMN status TEXT;
ALTER TABLE international_items ADD COLUMN year INTEGER;
ALTER TABLE international_items ADD COLUMN description TEXT;
ALTER TABLE international_items ADD COLUMN url TEXT;
ALTER TABLE international_items ADD COLUMN continent TEXT;
UPDATE international_items SET description = text, status = CASE type WHEN 'approved_cooperation' THEN '已核定' WHEN 'visit_exchange' THEN '技術交流' ELSE '洽談中' END;

ALTER TABLE lab_members ADD COLUMN role TEXT;
ALTER TABLE lab_members ADD COLUMN cohort TEXT;
ALTER TABLE lab_members ADD COLUMN research_topic TEXT;
ALTER TABLE lab_members ADD COLUMN is_alumni INTEGER NOT NULL DEFAULT 0;
ALTER TABLE lab_members ADD COLUMN photo TEXT;
ALTER TABLE lab_activities ADD COLUMN activity_date TEXT;
ALTER TABLE lab_activities ADD COLUMN category TEXT;
ALTER TABLE lab_activities ADD COLUMN description TEXT;
ALTER TABLE lab_activities ADD COLUMN photo TEXT;

CREATE TABLE academic_links (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, sort_order INTEGER DEFAULT 0);
INSERT INTO academic_links (name, url, sort_order) VALUES
('Google Scholar', 'https://scholar.google.com/', 0), ('ORCID', 'https://orcid.org/', 1), ('Scopus', 'https://www.scopus.com/', 2), ('ResearchGate', 'https://www.researchgate.net/', 3);

CREATE TABLE honors (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER NOT NULL, month INTEGER, name TEXT NOT NULL, organization TEXT, category TEXT NOT NULL, description TEXT, sort_order INTEGER DEFAULT 0);
CREATE TABLE news (id INTEGER PRIMARY KEY AUTOINCREMENT, news_date TEXT NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, content TEXT, photo TEXT, url TEXT, is_pinned INTEGER NOT NULL DEFAULT 0, sort_order INTEGER DEFAULT 0);
CREATE TABLE invited_talks (id INTEGER PRIMARY KEY AUTOINCREMENT, talk_date TEXT, title TEXT NOT NULL, organization TEXT, category TEXT, is_featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER DEFAULT 0);
CREATE TABLE review_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, journal TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, sort_order INTEGER DEFAULT 0);

UPDATE navigation_items SET sort_order = 10 WHERE path = 'contact';
INSERT OR IGNORE INTO navigation_items (name, path, sort_order, is_visible) VALUES ('Honors', 'honors', 8, 1), ('News', 'news', 9, 1);

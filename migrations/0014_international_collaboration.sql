ALTER TABLE international_items ADD COLUMN region TEXT;
ALTER TABLE international_items ADD COLUMN institution TEXT;
ALTER TABLE international_items ADD COLUMN link TEXT;
ALTER TABLE international_items ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0;
ALTER TABLE international_items ADD COLUMN is_note INTEGER NOT NULL DEFAULT 0;

CREATE TABLE international_conferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  city TEXT,
  year INTEGER,
  link TEXT,
  is_published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO international_items (type, region, country, institution, status, year, description, link, is_published, is_note, text, sort_order)
VALUES
  ('approved_cooperation', 'europe', NULL, '義大利國家研究委員會 CNR', 'approved', NULL, '已核定國際人才培育合作。', NULL, 1, 0, '義大利國家研究委員會 CNR', 1),
  ('approved_cooperation', 'east_asia', NULL, '日本筑波大學', 'approved', NULL, '已核定國際人才培育合作。', NULL, 1, 0, '日本筑波大學', 1),
  ('developing_cooperation', 'east_asia', NULL, '京都大學防災研究所', 'discussing', NULL, '合作尚處洽談、共同研議或規劃階段。', NULL, 1, 0, '京都大學防災研究所', 2),
  ('approved_cooperation', 'southeast_asia', NULL, '泰國清邁大學及相關研究中心', 'approved', NULL, '已核定國際人才培育合作。', NULL, 1, 0, '泰國清邁大學及相關研究中心', 1),
  ('developing_cooperation', 'south_asia', NULL, 'Adamas University', 'discussing', NULL, '合作尚處洽談、共同研議或規劃階段。', NULL, 1, 0, 'Adamas University', 1),
  ('developing_cooperation', 'oceania', NULL, 'University of Technology Sydney', 'discussing', NULL, '合作尚處洽談、共同研議或規劃階段。', NULL, 1, 0, 'University of Technology Sydney', 1),
  ('visit_exchange', 'americas', NULL, 'University of Colorado Denver', 'exchange', 2017, '2017年於University of Colorado Denver進行訪問研究。', NULL, 1, 0, 'University of Colorado Denver', 1),
  ('visit_exchange', 'americas', NULL, '美國墾務局', 'exchange', NULL, '與美國墾務局進行水庫與河川數值模式及SRH相關技術交流。', NULL, 1, 0, '美國墾務局', 2),
  ('developing_cooperation', 'americas', NULL, 'Colorado State University', 'discussing', NULL, '合作尚處洽談、共同研議或規劃階段。', NULL, 1, 0, 'Colorado State University', 3),
  ('visit_exchange', 'americas', NULL, NULL, 'exchange', NULL, '參與臺美水利技術引進及應用研究。', NULL, 1, 1, '參與臺美水利技術引進及應用研究。', 4);

INSERT INTO international_conferences (name, city, year, link, is_published, sort_order)
VALUES
  ('EGU', NULL, NULL, NULL, 1, 1),
  ('AGU', NULL, NULL, NULL, 1, 2),
  ('AOGS', NULL, NULL, NULL, 1, 3),
  ('JpGU', NULL, NULL, NULL, 1, 4),
  ('水庫沉砂繞道相關國際會議', NULL, NULL, NULL, 1, 5);

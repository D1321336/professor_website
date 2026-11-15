CREATE TABLE research_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  note TEXT,
  sort_order INTEGER DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'draft'
);

INSERT INTO research_stats (value, label, note, sort_order, visibility)
VALUES
  ('16', '期刊論文', NULL, 1, 'published'),
  ('28', '研討會論文', NULL, 2, 'published'),
  ('3', '發明專利', NULL, 3, 'published'),
  ('18', '主持計畫', NULL, 4, 'published'),
  ('25', '受邀演講', NULL, 5, 'published'),
  ('60+', '期刊審稿', NULL, 6, 'published');

INSERT OR IGNORE INTO navigation_items (name, path, sort_order, is_visible)
VALUES ('Honors', 'honors', 8, 1), ('News', 'news', 9, 1);

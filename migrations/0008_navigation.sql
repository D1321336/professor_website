INSERT OR IGNORE INTO navigation_items (name, path, sort_order, is_visible) VALUES ('Honors', 'honors', 8, 1);
INSERT OR IGNORE INTO navigation_items (name, path, sort_order, is_visible) VALUES ('News', 'news', 9, 1);
UPDATE navigation_items SET sort_order = 10 WHERE path = 'contact';

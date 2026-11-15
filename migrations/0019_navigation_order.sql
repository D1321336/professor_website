-- Keep the existing navigation records, but assign a collision-free order first.
UPDATE navigation_items SET sort_order = 100 + id;

UPDATE navigation_items SET sort_order = 1 WHERE path = 'home';
UPDATE navigation_items SET sort_order = 2 WHERE path = 'news';
UPDATE navigation_items SET sort_order = 3 WHERE path = 'honors';
UPDATE navigation_items SET sort_order = 4 WHERE path = 'research';
UPDATE navigation_items SET sort_order = 5 WHERE path = 'publications';
UPDATE navigation_items SET sort_order = 6 WHERE path = 'projects';
UPDATE navigation_items SET sort_order = 7 WHERE path = 'experience';
UPDATE navigation_items SET sort_order = 8 WHERE path = 'international';
UPDATE navigation_items SET sort_order = 9 WHERE path = 'lab';
UPDATE navigation_items SET sort_order = 10 WHERE path = 'contact';

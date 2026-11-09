DELETE FROM navigation_items WHERE path IN ('honors', 'news');
UPDATE navigation_items SET sort_order = 8 WHERE path = 'contact';
DELETE FROM academic_links;


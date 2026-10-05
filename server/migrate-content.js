import db from './db.js'

const navigationItems = [
  ['Home', 'home', 1, 1], ['Research', 'research', 2, 1],
  ['Publications', 'publications', 3, 1], ['Projects', 'projects', 4, 1],
  ['Experience', 'experience', 5, 1], ['International', 'international', 6, 1],
  ['Lab', 'lab', 7, 1], ['Contact', 'contact', 8, 1],
]

const siteSettings = [
  ['department_name', 'Department of Water Resources Engineering and Conservation'],
  ['footer_name', 'CHENG-CHIA HUANG'],
  ['brand_name', 'STARLAB'],
]

const contentGroups = [
  ['publications', 'journal', '期刊論文', '期刊論文', null, 1],
  ['publications', 'conference', '研討會論文', '研討會論文', null, 2],
  ['publications', 'other', '專利與其他著作', '專利與其他著作', null, 3],
  ['experience', 'professional_service', '專業服務', '專業服務', null, 1],
  ['experience', 'teaching', '教學與人才培育', '教學與人才培育', null, 2],
  ['experience', 'training', '專業訓練', '專業訓練', null, 3],
  ['international', 'visit_exchange', '國際訪問與技術交流', '訪問交流', null, 1],
  ['international', 'approved_cooperation', '已核定國際合作', '核定合作', null, 2],
  ['international', 'developing_cooperation', '洽談或發展中的合作', '發展合作', null, 3],
  ['lab', 'topics', '主要研究主題', '研究主題', 'RESEARCH TOPICS', 1],
  ['lab', 'members', '實驗室成員', '實驗室成員', 'LAB MEMBERS', 2],
  ['lab', 'activities', '實驗室活動', '實驗室活動', 'FIELD & LAB LOG', 3],
]

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`)
  db.run(`CREATE TABLE IF NOT EXISTS content_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    title TEXT NOT NULL,
    short_title TEXT,
    label TEXT,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(section, key)
  )`)
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS navigation_items_path_unique ON navigation_items(path)`)

  const navigationStmt = db.prepare(`
    INSERT OR IGNORE INTO navigation_items (name, path, sort_order, is_visible)
    VALUES (?, ?, ?, ?)
  `)
  navigationItems.forEach((item) => navigationStmt.run(item))
  navigationStmt.finalize()

  const settingStmt = db.prepare(`INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`)
  siteSettings.forEach((item) => settingStmt.run(item))
  settingStmt.finalize()

  const groupStmt = db.prepare(`
    INSERT OR IGNORE INTO content_groups (section, key, title, short_title, label, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  contentGroups.forEach((item) => groupStmt.run(item))
  groupStmt.finalize()
})

db.close((err) => {
  if (err) throw err
  console.log('Database content migration completed.')
})

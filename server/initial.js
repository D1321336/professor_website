import db from './db.js'

db.serialize(() => {
  // 導覽列
  db.run(`
    CREATE TABLE navigation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1
    )
  `)

  db.run(`
    CREATE TABLE site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE content_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      title TEXT NOT NULL,
      short_title TEXT,
      label TEXT,
      sort_order INTEGER DEFAULT 0,
      UNIQUE(section, key)
    )
  `)

  // 1-1、、1-2、2-1、9 教授基本資料
  db.run(`
    CREATE TABLE profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_zh TEXT NOT NULL,
      name_en TEXT,
      email TEXT,
      address TEXT,
      short_bio TEXT,
      full_bio TEXT,
      photo TEXT
    )
  `)

  // 1-1. 教授目前職稱
  db.run(`
    CREATE TABLE positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      organization TEXT,
      department TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `)

  // 1-3 首頁研究領域
  db.run(`
    CREATE TABLE research_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `)

  // 1-1、8-1 實驗室基本資料
  db.run(`
    CREATE TABLE labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      photo TEXT
    )
  `)

  // 2-2 研究興趣
  db.run(`
    CREATE TABLE research_interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 3 Research
  db.run(`
    CREATE TABLE research (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  );
  `)

  // 3-1 研究成果摘要
  db.run(`
    CREATE TABLE research_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
    );
  `)

  //4-1 期刊論文
  db.run(`
    CREATE TABLE journal_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    authors TEXT,
    title TEXT NOT NULL,
    journal TEXT,
    doi_url TEXT,
    sort_order INTEGER DEFAULT 0
    );
  `)

  //4-2 研討會論文

  db.run(`
    CREATE TABLE conference_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    authors TEXT,
    title TEXT NOT NULL,
    conference TEXT,
    sort_order INTEGER DEFAULT 0
    );
  `)

  //4-3 其他著作
  db.run(`
    CREATE TABLE other_publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
    );
  `)

  //4-4 發明專利
  db.run(`
    CREATE TABLE patents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    title TEXT NOT NULL,
    patent_number TEXT,
    inventor_or_owner TEXT,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 5 主持人計畫
  db.run(`
    CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT,
    title TEXT NOT NULL,
    organization TEXT,
    role TEXT,
    status TEXT,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 5 合作計畫摘要
  db.run(`
    CREATE TABLE collaboration_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 6-1 任職經歷
  db.run(`
    CREATE TABLE experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT,
    organization TEXT NOT NULL,
    position TEXT,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 經歷
  db.run(`
    CREATE TABLE experience_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 7 international
  db.run(`
    CREATE TABLE international_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
    );
  `)

  // 8-3 實驗室成員
  db.run(`
    CREATE TABLE lab_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,

      FOREIGN KEY (lab_id)
        REFERENCES labs(id)
        ON DELETE CASCADE
    )
  `)

  // 8-2. 實驗室主要研究主題
  db.run(`
    CREATE TABLE research_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,

      FOREIGN KEY (lab_id)
        REFERENCES labs(id)
        ON DELETE CASCADE
    )
  `)

  // 8-4. 實驗室活動
  db.run(`
    CREATE TABLE lab_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,

      FOREIGN KEY (lab_id)
        REFERENCES labs(id)
        ON DELETE CASCADE
    )
  `)
})

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message)
    return
  }

  console.log('Database initialized successfully.')
})

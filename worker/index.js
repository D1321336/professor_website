const SESSION_TTL_SECONDS = 8 * 60 * 60
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const PBKDF2_ITERATIONS = 100000

const resources = {
  profile: { label: '個人介紹與聯絡資訊', singleton: true, fields: [['name_zh', '中文姓名', 'text', true], ['name_en', '英文姓名'], ['email', 'Email', 'email'], ['address', '地址'], ['short_bio', '首頁簡介', 'textarea'], ['full_bio', '完整介紹', 'textarea']] },
  positions: { label: '目前職稱', fields: [['title', '職稱', 'text', true], ['organization', '機構'], ['department', '系所'], ['sort_order', '排序', 'number']] },
  research_areas: { label: '首頁研究領域', fields: [['title', '領域名稱', 'text', true], ['sort_order', '排序', 'number']] },
  research_interests: { label: '研究興趣', fields: [['title', '興趣名稱', 'text', true], ['sort_order', '排序', 'number']] },
  research: { label: '研究方向', fields: [['title', '標題', 'text', true], ['description', '說明', 'textarea'], ['basin_location', '流域位置', 'select', false, [['watershed', '集水區'], ['river', '河道'], ['reservoir', '水庫'], ['downstream_urban', '下游與都市']]], ['representative_outcome', '代表成果', 'textarea'], ['photo', '照片', 'image'], ['photo_position', '照片位置', 'hidden'], ['sort_order', '排序', 'number']] },
  research_summaries: { label: '研究成果摘要', fields: [['text', '摘要', 'textarea', true], ['sort_order', '排序', 'number']] },
  journal_papers: { label: '期刊論文', fields: [['year', '年份', 'number'], ['authors', '作者'], ['title', '論文標題', 'textarea', true], ['journal', '期刊'], ['is_scie', 'SCIE', 'checkbox'], ['is_ei', 'EI', 'checkbox'], ['is_featured', '是否精選', 'select', false, [['0', '否'], ['1', '是']]], ['doi_url', 'DOI／網址', 'url'], ['graphical_abstract', '圖像摘要', 'image'], ['sort_order', '排序', 'number']] },
  conference_papers: { label: '研討會論文', fields: [['year', '年份', 'number'], ['authors', '作者'], ['title', '論文標題', 'textarea', true], ['conference', '研討會'], ['is_ei', 'EI', 'checkbox'], ['is_featured', '是否精選', 'select', false, [['0', '否'], ['1', '是']]], ['graphical_abstract', '圖像摘要', 'image'], ['sort_order', '排序', 'number']] },
  other_works: { label: '專利與其他著作', virtual: true, fields: [['kind', '資料類型', 'select', true, [['publication', '其他著作'], ['patent', '發明專利'], ['utility_patent', '新型專利']]], ['year', '年份', 'number'], ['title', '標題', 'textarea', true], ['description', '著作說明', 'textarea'], ['patent_number', '專利號碼'], ['inventor_or_owner', '發明人／權利人'], ['sort_order', '排序', 'number']] },
  other_publications: { label: '其他著作', fields: [['year', '年份', 'number'], ['title', '標題', 'textarea', true], ['description', '說明', 'textarea'], ['sort_order', '排序', 'number']] },
  patents: { label: '專利', fields: [['year', '年份', 'number'], ['patent_type', '專利類型', 'select', false, [['invention', '發明專利'], ['utility', '新型專利']]], ['title', '專利名稱', 'textarea', true], ['patent_number', '專利號碼'], ['inventor_or_owner', '發明人／權利人'], ['sort_order', '排序', 'number']] },
  projects: { label: '主持人計畫', fields: [['project_type', '計畫類型', 'select', true, [['general', '一般計畫'], ['dream', '學海築夢']]], ['period', '學年度／梯次'], ['start_date', '開始日期', 'date'], ['end_date', '結束日期', 'date'], ['title', '計畫名稱', 'textarea', true], ['organization', '補助／合作機構'], ['funding_category', '補助單位', 'select', false, [['national_science', '國科會'], ['rural_conservation', '農村水保署'], ['water_resources', '水利署'], ['education', '教育部'], ['private', '民間']]], ['role', '角色'], ['summary', '計畫摘要', 'textarea'], ['research_location', '研究區位'], ['outcome_url', '成果連結', 'url'], ['photo', '照片', 'image'], ['photo_position', '照片位置', 'hidden'], ['sort_order', '排序', 'number']] },
  collaboration_projects: { label: '合作計畫摘要', fields: [['text', '摘要', 'textarea', true], ['sort_order', '排序', 'number']] },
  experiences: { label: '任職經歷', fields: [['period', '期間'], ['organization', '機構', 'text', true], ['position', '職位'], ['sort_order', '排序', 'number']] },
  experience_items: { label: '其他經歷', fields: [['type', '分類', 'select', true, [['professional_service', '專業服務'], ['teaching', '教學與人才培育'], ['training', '專業訓練']]], ['text', '內容', 'textarea', true], ['sort_order', '排序', 'number']] },
  international_items: { label: '國際合作單位', fields: [['region', '地理區域', 'select', true, [['europe', '歐洲'], ['east_asia', '東亞'], ['southeast_asia', '東南亞'], ['south_asia', '南亞'], ['oceania', '大洋洲'], ['americas', '美洲']]], ['country', '國家'], ['city', '城市'], ['institution', '合作單位'], ['status', '合作狀態', 'select', true, [['approved', '已核定'], ['exchange', '技術交流'], ['discussing', '洽談中']]], ['year', '年份', 'number'], ['description', '說明', 'textarea'], ['link', '相關連結', 'url'], ['is_note', '補充說明', 'hidden'], ['sort_order', '排序', 'number']] },
  international_conferences: { label: '國際會議足跡', fields: [['name', '會議名稱', 'text', true], ['city', '城市'], ['year', '年份', 'number'], ['link', '相關連結', 'url'], ['sort_order', '排序', 'number']] },
  labs: { label: '實驗室介紹', singleton: true, fields: [['name', '實驗室名稱', 'text', true], ['description', '實驗室介紹', 'textarea']] },
  research_topics: { label: '實驗室研究主題', labChild: true, fields: [['topic', '研究主題', 'textarea', true], ['sort_order', '排序', 'number']] },
  lab_members: { label: '實驗室成員', labChild: true, fields: [['name', '成員姓名', 'text', true], ['role', '身分'], ['cohort', '屆別'], ['research_topic', '研究題目', 'textarea'], ['is_alumni', '是否畢業', 'select', false, [['0', '在學'], ['1', '畢業']]], ['photo', '照片', 'image'], ['sort_order', '排序', 'number']] },
  lab_activities: { label: '活動紀錄', labChild: true, fields: [['activity_date', '日期', 'date'], ['category', '類別'], ['title', '活動名稱', 'textarea', true], ['description', '說明', 'textarea'], ['photo', '照片', 'image'], ['sort_order', '排序', 'number']] },
  academic_links: { label: '學術連結', fields: [['name', '名稱', 'text', true], ['url', '網址', 'url', true], ['sort_order', '排序', 'number']] },
  honors: { label: '榮譽獎項', fields: [['year', '年份', 'number', true], ['month', '月份', 'number'], ['name', '獎項名稱', 'textarea', true], ['organization', '頒發單位'], ['category', '類別', 'select', true, [['research', '研究'], ['teaching', '教學'], ['student_advising', '指導學生']]], ['description', '說明', 'textarea'], ['sort_order', '排序', 'number']] },
  news: { label: '最新消息', fields: [['news_date', '日期', 'date', true], ['category', '類別', 'select', true, [['受邀演講', '受邀演講'], ['國際交流', '國際交流'], ['論文發表', '論文發表'], ['計畫', '計畫'], ['學生與教學', '學生與教學']]], ['title', '標題', 'textarea', true], ['content', '內文', 'textarea'], ['photo', '照片', 'image'], ['url', '連結', 'url'], ['is_pinned', '是否置頂', 'select', false, [['0', '否'], ['1', '是']]], ['sort_order', '排序', 'number']] },
  invited_talks: { label: '受邀演講', fields: [['talk_date', '日期', 'date'], ['title', '題目', 'textarea', true], ['organization', '邀請單位'], ['category', '類別'], ['is_featured', '是否精選', 'select', false, [['0', '否'], ['1', '是']]], ['sort_order', '排序', 'number']] },
  review_stats: { label: '審稿統計', fields: [['journal', '期刊', 'text', true], ['count', '篇數', 'number', true], ['sort_order', '排序', 'number']] },
  research_stats: { label: '研究數據', fields: [['value', '數字', 'text', true], ['label', '標籤', 'text', true], ['source', '數字來源', 'select', true, [['manual', '手動輸入'], ['journal_count', '公開期刊論文數'], ['conference_count', '公開研討會論文數'], ['invention_patent_count', '公開發明專利數'], ['project_count', '公開計畫數']]], ['note', '註記'], ['sort_order', '排序', 'number']] },
}

const visibilityField = ['visibility', '公開狀態', 'select', false, [['published', '公開'], ['draft', '草稿'], ['hidden', '隱藏']]]
for (const definition of Object.values(resources)) {
  const englishFields = definition.fields
    .filter(([name, , type = 'text']) => !String(name).endsWith('_en') && !['name_zh', 'name_en', 'email', 'value'].includes(name) && ['text', 'textarea'].includes(type))
    .map(([name, label, type]) => [`${name}_en`, `${label}（英文）`, type])
  definition.fields.push(...englishFields)
  if (!definition.fields.some(([name]) => name === 'visibility')) definition.fields.push(visibilityField)
}

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
const empty = (status = 204) => new Response(null, { status })
const all = async (db, sql, values = []) => (await db.prepare(sql).bind(...values).all()).results
const first = async (db, sql, values = []) => db.prepare(sql).bind(...values).first()
const run = async (db, sql, values = []) => db.prepare(sql).bind(...values).run()

function publicDefinition([name, label, type = 'text', required = false, options]) {
  return { name, label, type, required, ...(options ? { options: options.map(([value, optionLabel]) => ({ value, label: optionLabel })) } : {}) }
}

function normalizePayload(definition, body) {
  const values = {}
  const isInternationalNote = definition === resources.international_items && body?.is_note
  for (const field of definition.fields) {
    const [name, , type = 'text', required = false, options] = field
    if (name === 'sort_order' && !Object.hasOwn(body || {}, name)) continue
    let value = body?.[name]
    if (definition === resources.international_items && name === 'status' && isInternationalNote && (value === '' || value == null)) value = 'exchange'
    if (definition === resources.international_items && name === 'region' && isInternationalNote && (value === '' || value == null)) value = null
    if (type === 'checkbox') value = value ? 1 : 0
    else if (type === 'number') value = value === '' || value == null ? null : Number(value)
    else if (type === 'select' && value != null) value = String(value)
    else value = typeof value === 'string' ? value.trim() : value
    if (required && !(isInternationalNote && name === 'region') && (value === '' || value == null)) throw new Error(`${field[1]}為必填欄位`)
    if (type === 'number' && value != null && !Number.isFinite(value)) throw new Error(`${field[1]}必須是數字`)
    if (options && value != null && !options.some(([option]) => option === value)) throw new Error(`${field[1]}的選項無效`)
    values[name] = value == null || value === '' ? null : value
  }
  if (definition === resources.international_items) {
    const status = String(values.status || '')
    values.type = status === 'approved' ? 'approved_cooperation' : status === 'discussing' ? 'developing_cooperation' : 'visit_exchange'
    values.text = String(values.institution || values.description || '國際合作補充說明')
  }
  return values
}

function bytesToBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(value, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}

async function verifyHmac(value, signature, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const normalized = signature.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  let signatureBytes
  try {
    signatureBytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
  } catch {
    return false
  }
  return crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(value))
}

function randomSalt() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))
}

async function hashPassword(password, salt = randomSalt()) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS }, key, 256)
  return `pbkdf2:${salt}:${bytesToBase64Url(new Uint8Array(bits))}`
}

async function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored || '').split(':')
  if (scheme !== 'pbkdf2' || !salt || !expected) return false
  const actual = await hashPassword(password, salt)
  return actual === stored
}

async function issueSession(username, secret) {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })))
  return `${payload}.${await hmac(payload, secret)}`
}

async function readSession(request, secret) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token || !secret) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !await verifyHmac(payload, signature, secret)) return null
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
    const session = JSON.parse(new TextDecoder().decode(bytes))
    return session.exp > Date.now() / 1000 ? session : null
  } catch {
    return null
  }
}

async function login(request, env) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return json({ error: '管理員帳號尚未設定' }, 503)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const now = Math.floor(Date.now() / 1000)
  const attempt = await first(env.DB, 'SELECT attempts, window_started_at FROM login_attempts WHERE ip = ?', [ip])
  if (attempt && now - attempt.window_started_at < 900 && attempt.attempts >= 10) return json({ error: '登入嘗試次數過多，請稍後再試' }, 429)
  const body = await request.json().catch(() => ({}))
  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  const userCount = Number((await first(env.DB, 'SELECT COUNT(*) AS count FROM admin_users'))?.count || 0)
  let user = userCount ? await first(env.DB, 'SELECT id, username, password_hash FROM admin_users WHERE username = ?', [username]) : null
  let valid = user ? await verifyPassword(password, user.password_hash) : false
  if (!userCount && username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    await run(env.DB, 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, await hashPassword(password)])
    user = await first(env.DB, 'SELECT id, username, password_hash FROM admin_users WHERE username = ?', [username])
    valid = true
  }
  if (!valid) {
    await run(env.DB, `INSERT INTO login_attempts (ip, attempts, window_started_at) VALUES (?, 1, ?)
      ON CONFLICT(ip) DO UPDATE SET attempts = CASE WHEN ? - window_started_at >= 900 THEN 1 ELSE attempts + 1 END,
      window_started_at = CASE WHEN ? - window_started_at >= 900 THEN ? ELSE window_started_at END`, [ip, now, now, now, now])
    return json({ error: '帳號或密碼錯誤' }, 401)
  }
  await run(env.DB, 'DELETE FROM login_attempts WHERE ip = ?', [ip])
  return json({ token: await issueSession(username, env.ADMIN_PASSWORD), username, expiresIn: SESSION_TTL_SECONDS })
}

async function publicApi(path, env) {
  if (path === '/api/home') {
    const [profile, positions, researchAreas, navigationItems, settingRows, contentGroups, latestNews, academicLinks, researchStats, journalPapersCount, conferencePapersCount, inventionPatentsCount, projectsCount] = await Promise.all([
      first(env.DB, "SELECT id, name_zh, name_en, email, address, address_en, short_bio, short_bio_en FROM profile WHERE visibility = 'published' LIMIT 1"),
      all(env.DB, "SELECT id, title, title_en, organization, organization_en, department, department_en, sort_order FROM positions WHERE visibility = 'published' ORDER BY sort_order ASC"),
      all(env.DB, "SELECT id, title, title_en, sort_order FROM research_areas WHERE visibility = 'published' ORDER BY sort_order ASC"),
      all(env.DB, 'SELECT id, name, path, sort_order FROM navigation_items WHERE is_visible = 1 ORDER BY sort_order ASC'),
      all(env.DB, 'SELECT key, value FROM site_settings'),
      all(env.DB, 'SELECT id, section, key, title, title_en, short_title, short_title_en, label, label_en, sort_order FROM content_groups ORDER BY section ASC, sort_order ASC'),
      all(env.DB, "SELECT id, news_date, category, category_en, title, title_en, content, content_en, photo, url FROM news WHERE visibility = 'published' ORDER BY news_date DESC, id DESC LIMIT 3"),
      all(env.DB, "SELECT id, name, name_en, url, sort_order FROM academic_links WHERE visibility = 'published' ORDER BY sort_order ASC"),
      all(env.DB, "SELECT id, value, label, label_en, source, note, note_en, sort_order FROM research_stats WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC"),
      first(env.DB, "SELECT COUNT(*) AS count FROM journal_papers WHERE visibility = 'published'"),
      first(env.DB, "SELECT COUNT(*) AS count FROM conference_papers WHERE visibility = 'published'"),
      first(env.DB, "SELECT COUNT(*) AS count FROM patents WHERE visibility = 'published' AND (patent_type = 'invention' OR patent_type IS NULL)"),
      first(env.DB, "SELECT COUNT(*) AS count FROM projects WHERE visibility = 'published'"),
    ])
    const calculatedValues = {
      journal_count: String(Number(journalPapersCount?.count || 0)),
      conference_count: String(Number(conferencePapersCount?.count || 0)),
      invention_patent_count: String(Number(inventionPatentsCount?.count || 0)),
      project_count: String(Number(projectsCount?.count || 0)),
    }
    const resolvedResearchStats = researchStats.map((row) => ({ ...row, value: calculatedValues[row.source] ?? row.value }))
    return json({ profile, positions, research_areas: researchAreas, navigation_items: navigationItems, settings: Object.fromEntries(settingRows.map((row) => [row.key, row.value])), content_groups: contentGroups, latest_news: latestNews, academic_links: academicLinks, research_stats: resolvedResearchStats })
  }
  if (path === '/api/about') return json({ profile: await first(env.DB, "SELECT id, name_zh, name_en, full_bio, full_bio_en FROM profile WHERE visibility = 'published' LIMIT 1"), research_interests: await all(env.DB, "SELECT id, title, title_en, sort_order FROM research_interests WHERE visibility = 'published' ORDER BY sort_order ASC") })
  if (path === '/api/research') return json({ research: await all(env.DB, "SELECT id, title, title_en, description, description_en, representative_outcome, representative_outcome_en, photo, photo_position, sort_order FROM research WHERE visibility = 'published' ORDER BY sort_order ASC"), research_summaries: await all(env.DB, "SELECT id, text, text_en, sort_order FROM research_summaries WHERE visibility = 'published' ORDER BY sort_order ASC") })
  if (path === '/api/publications') return json({
    journal_papers: await all(env.DB, "SELECT id, year, authors, authors_en, title, title_en, journal, journal_en, doi_url, index_type, is_scie, is_ei, is_featured, graphical_abstract, sort_order FROM journal_papers WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC"),
    conference_papers: await all(env.DB, "SELECT id, year, authors, authors_en, title, title_en, conference, conference_en, is_ei, is_featured, graphical_abstract, sort_order FROM conference_papers WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC"),
    other_publications: await all(env.DB, "SELECT id, year, title, title_en, description, description_en, sort_order FROM other_publications WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC"),
    patents: await all(env.DB, "SELECT id, year, patent_type, title, title_en, patent_number, inventor_or_owner, inventor_or_owner_en, sort_order FROM patents WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC"),
  })
  if (path === '/api/projects') return json({ projects: await all(env.DB, "SELECT id, project_type, period, period_en, start_date, end_date, title, title_en, organization, organization_en, role, role_en, status, status_override, funding_category, summary, summary_en, research_location, research_location_en, outcome_url, photo, photo_position, sort_order FROM projects WHERE visibility = 'published' ORDER BY sort_order ASC"), collaboration_projects: await all(env.DB, "SELECT id, text, text_en, sort_order FROM collaboration_projects WHERE visibility = 'published' ORDER BY sort_order ASC") })
  if (path === '/api/experience') {
    const experiences = await all(env.DB, "SELECT id, period, period_en, organization, organization_en, position, position_en, sort_order FROM experiences WHERE visibility = 'published' ORDER BY sort_order ASC")
    const items = await all(env.DB, "SELECT id, type, text, text_en, sort_order FROM experience_items WHERE visibility = 'published' ORDER BY sort_order ASC")
    return json({ experiences, experience_items: { professional_service: items.filter((item) => item.type === 'professional_service'), teaching: items.filter((item) => item.type === 'teaching'), training: items.filter((item) => item.type === 'training') } })
  }
  if (path === '/api/international') {
    const items = await all(env.DB, "SELECT id, region, country, country_en, city, city_en, institution, institution_en, status, year, description, description_en, link, is_note, sort_order FROM international_items WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC")
    const conferences = await all(env.DB, "SELECT id, name, name_en, city, city_en, year, link, sort_order FROM international_conferences WHERE visibility = 'published' ORDER BY sort_order ASC, id ASC")
    const regions = Object.fromEntries(['europe', 'east_asia', 'southeast_asia', 'south_asia', 'oceania', 'americas'].map((region) => [region, items.filter((item) => item.region === region && !item.is_note)]))
    const notes = items.filter((item) => item.is_note)
    return json({ regions, notes, conferences })
  }
  if (path === '/api/lab') {
    const lab = await first(env.DB, "SELECT id, name, name_en, description, description_en FROM labs WHERE visibility = 'published' LIMIT 1")
    if (!lab) return json({ error: 'Lab not found' }, 404)
    return json({ lab, research_topics: await all(env.DB, "SELECT id, topic, topic_en, sort_order FROM research_topics WHERE lab_id = ? AND visibility = 'published' ORDER BY sort_order ASC", [lab.id]), lab_members: await all(env.DB, "SELECT id, name, name_en, role, role_en, cohort, cohort_en, research_topic, research_topic_en, is_alumni, photo, sort_order FROM lab_members WHERE lab_id = ? AND visibility = 'published' ORDER BY sort_order ASC", [lab.id]), lab_activities: await all(env.DB, "SELECT id, activity_date, category, category_en, title, title_en, description, description_en, photo, sort_order FROM lab_activities WHERE lab_id = ? AND visibility = 'published' ORDER BY sort_order ASC", [lab.id]) })
  }
  if (path === '/api/honors') return json({ honors: await all(env.DB, "SELECT id, year, month, name, name_en, organization, organization_en, category, description, description_en FROM honors WHERE visibility = 'published' ORDER BY year DESC, month DESC, sort_order ASC") })
  if (path === '/api/news') return json({ news: await all(env.DB, "SELECT id, news_date, category, category_en, title, title_en, content, content_en, photo, url, is_pinned FROM news WHERE visibility = 'published' ORDER BY news_date DESC, id DESC") })
  if (path === '/api/academic-links') return json({ academic_links: await all(env.DB, "SELECT id, name, name_en, url, sort_order FROM academic_links WHERE visibility = 'published' ORDER BY sort_order ASC") })
  if (path === '/api/service-stats') return json({ invited_talks: await all(env.DB, "SELECT id, talk_date, title, title_en, organization, organization_en, category, category_en, is_featured FROM invited_talks WHERE visibility = 'published' ORDER BY talk_date DESC"), review_stats: await all(env.DB, "SELECT id, journal, journal_en, count FROM review_stats WHERE visibility = 'published' ORDER BY count DESC, sort_order ASC") })
  return null
}

const decodeOtherWorkId = (value) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 1) return null
  return id % 2 === 0 ? { table: 'patents', id: id / 2, kind: 'patent' } : { table: 'other_publications', id: (id - 1) / 2, kind: 'publication' }
}

async function uploadImage(request, env) {
  const body = await request.json().catch(() => ({}))
  const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
  const extension = extensions[String(body.mimeType || '')]
  if (!extension || !body.data) return json({ error: '僅支援 JPG、PNG、WebP 或 GIF 圖片' }, 400)
  let bytes
  try {
    const binary = atob(String(body.data))
    bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  } catch {
    return json({ error: '圖片資料無效' }, 400)
  }
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) return json({ error: '圖片大小不可超過 5 MB' }, 400)
  const key = `${Date.now()}-${crypto.randomUUID()}.${extension}`
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: body.mimeType, cacheControl: 'public, max-age=31536000, immutable' } })
  return json({ path: `/uploads/${key}` }, 201)
}

async function adminApi(request, path, env) {
  if (path === '/api/admin/login' && request.method === 'POST') return login(request, env)
  const session = await readSession(request, env.ADMIN_PASSWORD)
  if (!session) return json({ error: '請重新登入管理後台' }, 401)
  const suffix = path.slice('/api/admin'.length)
  if (suffix === '/session' && request.method === 'GET') return json({ username: session.username })
  if (suffix === '/logout' && request.method === 'POST') return empty()
  if (suffix === '/account/password' && request.method === 'PUT') {
    const body = await request.json().catch(() => ({}))
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')
    if (newPassword.length < 12) return json({ error: '新密碼至少需要 12 個字元' }, 400)
    const user = await first(env.DB, 'SELECT id, password_hash FROM admin_users WHERE username = ?', [session.username])
    if (!user || !await verifyPassword(currentPassword, user.password_hash)) return json({ error: '目前密碼不正確' }, 400)
    await run(env.DB, 'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [await hashPassword(newPassword), user.id])
    return empty()
  }
  if (suffix === '/accounts' && request.method === 'GET') {
    return json(await all(env.DB, 'SELECT id, username, created_at, updated_at FROM admin_users ORDER BY id ASC'))
  }
  if (suffix === '/accounts' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}))
    const username = String(body.username || '').trim()
    const password = String(body.password || '')
    if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) return json({ error: '帳號需為 3–40 個英數字、句點、底線或連字號' }, 400)
    if (password.length < 12) return json({ error: '密碼至少需要 12 個字元' }, 400)
    try {
      const result = await run(env.DB, 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, await hashPassword(password)])
      return json({ id: result.meta.last_row_id, username }, 201)
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) return json({ error: '這個帳號已存在' }, 409)
      throw error
    }
  }
  if (suffix === '/resources' && request.method === 'GET') return json(Object.entries(resources).filter(([key]) => !['other_publications', 'patents'].includes(key)).map(([key, definition]) => {
    const fields = definition.fields.filter(([name]) => name !== 'sort_order')
    if (key === 'other_works' && !fields.some(([name]) => name === 'kind')) fields.unshift(['kind', '資料類型', 'select', true, [['publication', '其他著作'], ['patent', '發明專利'], ['utility_patent', '新型專利']]])
    return { key, label: definition.label, singleton: Boolean(definition.singleton), sortable: definition.fields.some(([name]) => name === 'sort_order'), fields: fields.map(publicDefinition) }
  }))
  if (suffix === '/upload' && request.method === 'POST') return uploadImage(request, env)

  const parts = suffix.split('/').filter(Boolean)
  const resource = parts[0]
  if (!resource || !resources[resource]) return json({ error: '找不到這個管理項目' }, 404)
  if (resource === 'other_works') return otherWorksApi(request, parts, env)
  const definition = resources[resource]

  if (request.method === 'GET' && parts.length === 1) {
    const fields = ['id', ...definition.fields.map(([name]) => name)]
    const order = definition.fields.some(([name]) => name === 'sort_order') ? ' ORDER BY sort_order ASC, id ASC' : ' ORDER BY id ASC'
    return json(await all(env.DB, `SELECT ${fields.join(', ')} FROM ${resource}${order}`))
  }
  if (request.method === 'POST' && parts.length === 1) {
    if (definition.singleton) return json({ error: '固定內容不可新增' }, 405)
    const values = normalizePayload(definition, await request.json().catch(() => ({})))
    if (definition.fields.some(([name]) => name === 'sort_order')) values.sort_order = Number((await first(env.DB, `SELECT COALESCE(MAX(sort_order), -1) AS value FROM ${resource}`)).value) + 1
    if (definition.labChild) {
      const lab = await first(env.DB, 'SELECT id FROM labs ORDER BY id ASC LIMIT 1')
      if (!lab) return json({ error: '請先建立實驗室資料' }, 409)
      values.lab_id = lab.id
    }
    const columns = Object.keys(values)
    const result = await run(env.DB, `INSERT INTO ${resource} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, Object.values(values))
    return json(await first(env.DB, `SELECT * FROM ${resource} WHERE id = ?`, [result.meta.last_row_id]), 201)
  }
  if (request.method === 'PUT' && parts[1] === 'reorder') {
    if (!definition.fields.some(([name]) => name === 'sort_order')) return json({ error: '這個項目不支援排序' }, 405)
    const ids = (await request.json().catch(() => ({}))).ids?.map(Number) || []
    if (!ids.length || ids.some((id) => !Number.isInteger(id) || id <= 0) || new Set(ids).size !== ids.length) return json({ error: '排序資料無效' }, 400)
    await env.DB.batch(ids.map((id, index) => env.DB.prepare(`UPDATE ${resource} SET sort_order = ? WHERE id = ?`).bind(index, id)))
    return empty()
  }
  const id = Number(parts[1])
  if (!Number.isInteger(id) || id <= 0) return json({ error: '資料編號無效' }, 400)
  if (request.method === 'PUT') {
    const values = normalizePayload(definition, await request.json().catch(() => ({})))
    const columns = Object.keys(values)
    const result = await run(env.DB, `UPDATE ${resource} SET ${columns.map((name) => `${name} = ?`).join(', ')} WHERE id = ?`, [...Object.values(values), id])
    if (!result.meta.changes) return json({ error: '找不到要修改的資料' }, 404)
    return json(await first(env.DB, `SELECT * FROM ${resource} WHERE id = ?`, [id]))
  }
  if (request.method === 'DELETE') {
    if (definition.singleton) return json({ error: '固定內容不可刪除' }, 405)
    const result = await run(env.DB, `DELETE FROM ${resource} WHERE id = ?`, [id])
    return result.meta.changes ? empty() : json({ error: '找不到要刪除的資料' }, 404)
  }
  return json({ error: '不支援的操作' }, 405)
}

async function otherWorksApi(request, parts, env) {
  if (request.method === 'GET' && parts.length === 1) return json(await all(env.DB, `SELECT id * 2 AS id, CASE WHEN patent_type = 'utility' THEN 'utility_patent' ELSE 'patent' END AS kind, year, title, title_en, NULL AS description, NULL AS description_en, patent_number, inventor_or_owner, inventor_or_owner_en, sort_order, visibility FROM patents UNION ALL SELECT id * 2 + 1 AS id, 'publication' AS kind, year, title, title_en, description, description_en, NULL AS patent_number, NULL AS inventor_or_owner, NULL AS inventor_or_owner_en, sort_order, visibility FROM other_publications ORDER BY sort_order ASC, id ASC`))
  if (request.method === 'POST' && parts.length === 1) {
    const values = normalizePayload(resources.other_works, await request.json().catch(() => ({})))
    const last = await first(env.DB, 'SELECT MAX(value) AS value FROM (SELECT COALESCE(MAX(sort_order), -1) AS value FROM patents UNION ALL SELECT COALESCE(MAX(sort_order), -1) FROM other_publications)')
    const sortOrder = Number(last.value) + 1
    if (values.kind === 'patent' || values.kind === 'utility_patent') {
      const result = await run(env.DB, 'INSERT INTO patents (year, patent_type, title, title_en, patent_number, inventor_or_owner, inventor_or_owner_en, sort_order, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [values.year, values.kind === 'utility_patent' ? 'utility' : 'invention', values.title, values.title_en, values.patent_number, values.inventor_or_owner, values.inventor_or_owner_en, sortOrder, values.visibility || 'draft'])
      return json({ ...values, id: result.meta.last_row_id * 2, sort_order: sortOrder }, 201)
    }
    const result = await run(env.DB, 'INSERT INTO other_publications (year, title, title_en, description, description_en, sort_order, visibility) VALUES (?, ?, ?, ?, ?, ?, ?)', [values.year, values.title, values.title_en, values.description, values.description_en, sortOrder, values.visibility || 'draft'])
    return json({ ...values, id: result.meta.last_row_id * 2 + 1, sort_order: sortOrder }, 201)
  }
  if (request.method === 'PUT' && parts[1] === 'reorder') {
    const items = (await request.json().catch(() => ({}))).ids?.map(decodeOtherWorkId) || []
    if (!items.length || items.some((item) => !item)) return json({ error: '排序資料無效' }, 400)
    await env.DB.batch(items.map((item, index) => env.DB.prepare(`UPDATE ${item.table} SET sort_order = ? WHERE id = ?`).bind(index, item.id)))
    return empty()
  }
  const item = decodeOtherWorkId(parts[1])
  if (!item) return json({ error: '資料編號無效' }, 400)
  if (request.method === 'PUT') {
    const values = normalizePayload(resources.other_works, await request.json().catch(() => ({})))
    const sourceRow = await first(env.DB, `SELECT sort_order FROM ${item.table} WHERE id = ?`, [item.id])
    if (!sourceRow) return json({ error: '找不到要修改的資料' }, 404)
    const sourceIsPatent = item.table === 'patents'
    const targetIsPatent = values.kind === 'patent' || values.kind === 'utility_patent'
    if (sourceIsPatent !== targetIsPatent) {
      if (targetIsPatent) {
        const result = await run(env.DB, 'INSERT INTO patents (year, patent_type, title, title_en, patent_number, inventor_or_owner, inventor_or_owner_en, sort_order, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [values.year, values.kind === 'utility_patent' ? 'utility' : 'invention', values.title, values.title_en, values.patent_number, values.inventor_or_owner, values.inventor_or_owner_en, sourceRow.sort_order, values.visibility || 'draft'])
        await run(env.DB, 'DELETE FROM other_publications WHERE id = ?', [item.id])
        return json({ ...values, id: result.meta.last_row_id * 2, sort_order: sourceRow.sort_order })
      }
      const result = await run(env.DB, 'INSERT INTO other_publications (year, title, title_en, description, description_en, sort_order, visibility) VALUES (?, ?, ?, ?, ?, ?, ?)', [values.year, values.title, values.title_en, values.description, values.description_en, sourceRow.sort_order, values.visibility || 'draft'])
      await run(env.DB, 'DELETE FROM patents WHERE id = ?', [item.id])
      return json({ ...values, id: result.meta.last_row_id * 2 + 1, sort_order: sourceRow.sort_order })
    }
    const statement = item.kind === 'patent' || item.kind === 'utility_patent'
      ? ['UPDATE patents SET year = ?, patent_type = ?, title = ?, title_en = ?, patent_number = ?, inventor_or_owner = ?, inventor_or_owner_en = ?, visibility = ? WHERE id = ?', [values.year, values.kind === 'utility_patent' ? 'utility' : 'invention', values.title, values.title_en, values.patent_number, values.inventor_or_owner, values.inventor_or_owner_en, values.visibility || 'draft', item.id]]
      : ['UPDATE other_publications SET year = ?, title = ?, title_en = ?, description = ?, description_en = ?, visibility = ? WHERE id = ?', [values.year, values.title, values.title_en, values.description, values.description_en, values.visibility || 'draft', item.id]]
    const result = await run(env.DB, statement[0], statement[1])
    return result.meta.changes ? json({ ...values, id: Number(parts[1]) }) : json({ error: '找不到要修改的資料' }, 404)
  }
  if (request.method === 'DELETE') {
    const result = await run(env.DB, `DELETE FROM ${item.table} WHERE id = ?`, [item.id])
    return result.meta.changes ? empty() : json({ error: '找不到要刪除的資料' }, 404)
  }
  return json({ error: '不支援的操作' }, 405)
}

async function serveUpload(path, env) {
  const key = decodeURIComponent(path.slice('/uploads/'.length))
  if (!key || key.includes('/') || key.includes('..')) return json({ error: '找不到圖片' }, 404)
  const object = await env.MEDIA.get(key)
  if (!object) return json({ error: '找不到圖片' }, 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    try {
      if (pathname.startsWith('/uploads/')) return serveUpload(pathname, env)
      if (pathname.startsWith('/api/admin')) return adminApi(request, pathname, env)
      if (request.method === 'GET' && pathname.startsWith('/api/')) return (await publicApi(pathname, env)) || json({ error: 'Not found' }, 404)
      return env.ASSETS.fetch(request)
    } catch (error) {
      console.error('Request failed', error)
      const message = error instanceof Error && !/D1|SQL|database/i.test(error.message) ? error.message : '服務暫時無法使用'
      return json({ error: message }, 500)
    }
  },
}

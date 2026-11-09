const SESSION_TTL_SECONDS = 8 * 60 * 60
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const resources = {
  profile: { label: '個人介紹與聯絡資訊', singleton: true, fields: [['name_zh', '中文姓名', 'text', true], ['name_en', '英文姓名'], ['email', 'Email', 'email'], ['address', '地址'], ['short_bio', '首頁簡介', 'textarea'], ['full_bio', '完整介紹', 'textarea']] },
  positions: { label: '目前職稱', fields: [['title', '職稱', 'text', true], ['organization', '機構'], ['department', '系所'], ['sort_order', '排序', 'number']] },
  research_areas: { label: '首頁研究領域', fields: [['title', '領域名稱', 'text', true], ['sort_order', '排序', 'number']] },
  research_interests: { label: '研究興趣', fields: [['title', '興趣名稱', 'text', true], ['sort_order', '排序', 'number']] },
  research: { label: '研究方向', fields: [['title', '標題', 'text', true], ['description', '說明', 'textarea'], ['photo', '照片', 'image'], ['photo_position', '照片位置', 'hidden'], ['sort_order', '排序', 'number']] },
  research_summaries: { label: '研究成果摘要', fields: [['text', '摘要', 'textarea', true], ['sort_order', '排序', 'number']] },
  journal_papers: { label: '期刊論文', fields: [['year', '年份', 'number'], ['authors', '作者'], ['title', '論文標題', 'textarea', true], ['journal', '期刊'], ['doi_url', 'DOI／網址', 'url'], ['photo', '照片', 'image'], ['photo_position', '照片位置', 'hidden'], ['sort_order', '排序', 'number']] },
  conference_papers: { label: '研討會論文', fields: [['year', '年份', 'number'], ['authors', '作者'], ['title', '論文標題', 'textarea', true], ['conference', '研討會'], ['photo', '照片', 'image'], ['photo_position', '照片位置', 'hidden'], ['sort_order', '排序', 'number']] },
  other_works: { label: '專利與其他著作', virtual: true, fields: [['kind', '資料類型', 'select', true, [['publication', '其他著作'], ['patent', '發明專利']]], ['year', '年份', 'number'], ['title', '標題', 'textarea', true], ['description', '著作說明', 'textarea'], ['patent_number', '專利號碼'], ['inventor_or_owner', '發明人／權利人'], ['sort_order', '排序', 'number']] },
  other_publications: { label: '其他著作', fields: [['year', '年份', 'number'], ['title', '標題', 'textarea', true], ['description', '說明', 'textarea'], ['sort_order', '排序', 'number']] },
  patents: { label: '發明專利', fields: [['year', '年份', 'number'], ['title', '專利名稱', 'textarea', true], ['patent_number', '專利號碼'], ['inventor_or_owner', '發明人／權利人'], ['sort_order', '排序', 'number']] },
  projects: { label: '主持人計畫', fields: [['period', '期間'], ['title', '計畫名稱', 'textarea', true], ['organization', '補助／合作機構'], ['role', '角色'], ['status', '狀態'], ['photo', '照片', 'image'], ['photo_position', '照片位置', 'hidden'], ['sort_order', '排序', 'number']] },
  collaboration_projects: { label: '合作計畫摘要', fields: [['text', '摘要', 'textarea', true], ['sort_order', '排序', 'number']] },
  experiences: { label: '任職經歷', fields: [['period', '期間'], ['organization', '機構', 'text', true], ['position', '職位'], ['sort_order', '排序', 'number']] },
  experience_items: { label: '其他經歷', fields: [['type', '分類', 'select', true, [['professional_service', '專業服務'], ['teaching', '教學與人才培育'], ['training', '專業訓練']]], ['text', '內容', 'textarea', true], ['sort_order', '排序', 'number']] },
  international_items: { label: '國際交流', fields: [['type', '分類', 'select', true, [['visit_exchange', '國際訪問與技術交流'], ['approved_cooperation', '已核定國際合作'], ['developing_cooperation', '發展中的合作']]], ['text', '內容', 'textarea', true], ['sort_order', '排序', 'number']] },
  labs: { label: '實驗室介紹', singleton: true, fields: [['name', '實驗室名稱', 'text', true], ['description', '實驗室介紹', 'textarea']] },
  research_topics: { label: '實驗室研究主題', labChild: true, fields: [['topic', '研究主題', 'textarea', true], ['sort_order', '排序', 'number']] },
  lab_members: { label: '實驗室成員', labChild: true, fields: [['name', '成員姓名', 'text', true], ['sort_order', '排序', 'number']] },
  lab_activities: { label: '實驗室活動', labChild: true, fields: [['title', '活動名稱', 'textarea', true], ['sort_order', '排序', 'number']] },
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
  for (const field of definition.fields) {
    const [name, , type = 'text', required = false, options] = field
    if (name === 'sort_order' && !Object.hasOwn(body || {}, name)) continue
    let value = body?.[name]
    if (type === 'number') value = value === '' || value == null ? null : Number(value)
    else value = typeof value === 'string' ? value.trim() : value
    if (required && (value === '' || value == null)) throw new Error(`${field[1]}為必填欄位`)
    if (type === 'number' && value != null && !Number.isFinite(value)) throw new Error(`${field[1]}必須是數字`)
    if (options && value != null && !options.some(([option]) => option === value)) throw new Error(`${field[1]}的選項無效`)
    values[name] = value === '' ? null : value
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
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 210000 }, key, 256)
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
    const [profile, positions, researchAreas, navigationItems, settingRows, contentGroups, latestNews] = await Promise.all([
      first(env.DB, 'SELECT id, name_zh, name_en, email, address, short_bio FROM profile LIMIT 1'),
      all(env.DB, 'SELECT id, title, organization, department, sort_order FROM positions ORDER BY sort_order ASC'),
      all(env.DB, 'SELECT id, title, sort_order FROM research_areas ORDER BY sort_order ASC'),
      all(env.DB, 'SELECT id, name, path, sort_order FROM navigation_items WHERE is_visible = 1 ORDER BY sort_order ASC'),
      all(env.DB, 'SELECT key, value FROM site_settings'),
      all(env.DB, 'SELECT id, section, key, title, short_title, label, sort_order FROM content_groups ORDER BY section ASC, sort_order ASC'),
      all(env.DB, 'SELECT id, news_date, category, title, content, photo, url FROM news ORDER BY is_pinned DESC, news_date DESC LIMIT 3'),
    ])
    return json({ profile, positions, research_areas: researchAreas, navigation_items: navigationItems, settings: Object.fromEntries(settingRows.map((row) => [row.key, row.value])), content_groups: contentGroups, latest_news: latestNews })
  }
  if (path === '/api/about') return json({ profile: await first(env.DB, 'SELECT id, name_zh, name_en, full_bio FROM profile LIMIT 1'), research_interests: await all(env.DB, 'SELECT id, title, sort_order FROM research_interests ORDER BY sort_order ASC') })
  if (path === '/api/research') return json({ research: await all(env.DB, 'SELECT id, title, description, photo, photo_position, sort_order FROM research ORDER BY sort_order ASC'), research_summaries: await all(env.DB, 'SELECT id, text, sort_order FROM research_summaries ORDER BY sort_order ASC') })
  if (path === '/api/publications') return json({
    journal_papers: await all(env.DB, 'SELECT id, year, authors, title, journal, doi_url, photo, photo_position, sort_order FROM journal_papers ORDER BY sort_order ASC, id ASC'),
    conference_papers: await all(env.DB, 'SELECT id, year, authors, title, conference, photo, photo_position, sort_order FROM conference_papers ORDER BY sort_order ASC, id ASC'),
    other_publications: await all(env.DB, 'SELECT id, year, title, description, sort_order FROM other_publications ORDER BY sort_order ASC, id ASC'),
    patents: await all(env.DB, 'SELECT id, year, title, patent_number, inventor_or_owner, sort_order FROM patents ORDER BY sort_order ASC, id ASC'),
  })
  if (path === '/api/projects') return json({ projects: await all(env.DB, 'SELECT id, period, title, organization, role, status, photo, photo_position, sort_order FROM projects ORDER BY sort_order ASC'), collaboration_projects: await all(env.DB, 'SELECT id, text, sort_order FROM collaboration_projects ORDER BY sort_order ASC') })
  if (path === '/api/experience') {
    const experiences = await all(env.DB, 'SELECT id, period, organization, position, sort_order FROM experiences ORDER BY sort_order ASC')
    const items = await all(env.DB, 'SELECT id, type, text, sort_order FROM experience_items ORDER BY sort_order ASC')
    return json({ experiences, experience_items: { professional_service: items.filter((item) => item.type === 'professional_service'), teaching: items.filter((item) => item.type === 'teaching'), training: items.filter((item) => item.type === 'training') } })
  }
  if (path === '/api/international') {
    const items = await all(env.DB, 'SELECT id, type, text, sort_order FROM international_items ORDER BY sort_order ASC')
    return json({ visit_exchange: items.filter((item) => item.type === 'visit_exchange'), approved_cooperation: items.filter((item) => item.type === 'approved_cooperation'), developing_cooperation: items.filter((item) => item.type === 'developing_cooperation') })
  }
  if (path === '/api/lab') {
    const lab = await first(env.DB, 'SELECT id, name, description FROM labs LIMIT 1')
    if (!lab) return json({ error: 'Lab not found' }, 404)
    return json({ lab, research_topics: await all(env.DB, 'SELECT id, topic, sort_order FROM research_topics WHERE lab_id = ? ORDER BY sort_order ASC', [lab.id]), lab_members: await all(env.DB, 'SELECT id, name, sort_order FROM lab_members WHERE lab_id = ? ORDER BY sort_order ASC', [lab.id]), lab_activities: await all(env.DB, 'SELECT id, title, sort_order FROM lab_activities WHERE lab_id = ? ORDER BY sort_order ASC', [lab.id]) })
  }
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
  if (suffix === '/resources' && request.method === 'GET') return json(Object.entries(resources).filter(([key]) => !['other_publications', 'patents'].includes(key)).map(([key, definition]) => ({ key, label: definition.label, singleton: Boolean(definition.singleton), sortable: definition.fields.some(([name]) => name === 'sort_order'), fields: definition.fields.filter(([name]) => name !== 'sort_order').map(publicDefinition) })))
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
  if (request.method === 'GET' && parts.length === 1) return json(await all(env.DB, `SELECT id * 2 AS id, 'patent' AS kind, year, title, NULL AS description, patent_number, inventor_or_owner, sort_order FROM patents UNION ALL SELECT id * 2 + 1 AS id, 'publication' AS kind, year, title, description, NULL AS patent_number, NULL AS inventor_or_owner, sort_order FROM other_publications ORDER BY sort_order ASC, id ASC`))
  if (request.method === 'POST' && parts.length === 1) {
    const values = normalizePayload(resources.other_works, await request.json().catch(() => ({})))
    const last = await first(env.DB, 'SELECT MAX(value) AS value FROM (SELECT COALESCE(MAX(sort_order), -1) AS value FROM patents UNION ALL SELECT COALESCE(MAX(sort_order), -1) FROM other_publications)')
    const sortOrder = Number(last.value) + 1
    if (values.kind === 'patent') {
      const result = await run(env.DB, 'INSERT INTO patents (year, title, patent_number, inventor_or_owner, sort_order) VALUES (?, ?, ?, ?, ?)', [values.year, values.title, values.patent_number, values.inventor_or_owner, sortOrder])
      return json({ ...values, id: result.meta.last_row_id * 2, sort_order: sortOrder }, 201)
    }
    const result = await run(env.DB, 'INSERT INTO other_publications (year, title, description, sort_order) VALUES (?, ?, ?, ?)', [values.year, values.title, values.description, sortOrder])
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
    const statement = item.kind === 'patent'
      ? ['UPDATE patents SET year = ?, title = ?, patent_number = ?, inventor_or_owner = ? WHERE id = ?', [values.year, values.title, values.patent_number, values.inventor_or_owner, item.id]]
      : ['UPDATE other_publications SET year = ?, title = ?, description = ? WHERE id = ?', [values.year, values.title, values.description, item.id]]
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

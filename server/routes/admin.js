import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import db from '../db.js'
import {
  authenticate,
  canAttemptLogin,
  clearLoginAttempts,
  requireAdmin,
  revokeSession,
} from '../auth.js'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDirectory = path.resolve(__dirname, '../../public/uploads')
const allowedImages = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const resources = {
  profile: {
    label: '個人介紹', singleton: true,
    fields: [
      ['name_zh', '中文姓名', 'text', true], ['name_en', '英文姓名'],
      ['short_bio', '首頁簡介', 'textarea'], ['full_bio', '完整介紹', 'textarea'],
    ],
  },
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

const dbAll = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)))
const dbGet = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)))
const dbRun = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
  if (error) reject(error)
  else resolve({ id: this.lastID, changes: this.changes })
}))

function publicDefinition([name, label, type = 'text', required = false, options]) {
  return { name, label, type, required, ...(options ? { options: options.map(([value, optionLabel]) => ({ value, label: optionLabel })) } : {}) }
}

function getResource(req, res) {
  const definition = resources[req.params.resource]
  if (!definition) res.status(404).json({ error: '找不到這個管理項目' })
  return definition
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

router.post('/login', async (req, res) => {
  const key = req.ip || 'unknown'
  if (!canAttemptLogin(key)) return res.status(429).json({ error: '登入嘗試次數過多，請稍後再試' })
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  try {
    const result = await authenticate(username, password)
    if (!result) return res.status(401).json({ error: '帳號或密碼錯誤' })
    clearLoginAttempts(key)
    res.json(result)
  } catch {
    console.error('Admin login failed:', error.message)
    res.status(500).json({ error: '登入服務暫時無法使用' })
  }
})

router.use(requireAdmin)

router.get('/session', (req, res) => res.json({ username: req.admin.username }))
router.post('/logout', (req, res) => { revokeSession(req.adminToken); res.status(204).end() })

router.get('/resources', (req, res) => {
  res.json(Object.entries(resources).filter(([key]) => !['other_publications', 'patents'].includes(key)).map(([key, definition]) => ({
    key,
    label: definition.label,
    singleton: Boolean(definition.singleton),
    sortable: definition.fields.some(([name]) => name === 'sort_order'),
    fields: definition.fields.filter(([name]) => name !== 'sort_order').map(publicDefinition),
  })))
})

const decodeOtherWorkId = (value) => {
  const syntheticId = Number(value)
  if (!Number.isInteger(syntheticId) || syntheticId <= 1) return null
  return syntheticId % 2 === 0
    ? { table: 'patents', id: syntheticId / 2, kind: 'patent' }
    : { table: 'other_publications', id: (syntheticId - 1) / 2, kind: 'publication' }
}

router.get('/other_works', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT id * 2 AS id, 'patent' AS kind, year, title, NULL AS description, patent_number, inventor_or_owner, sort_order FROM patents
      UNION ALL
      SELECT id * 2 + 1 AS id, 'publication' AS kind, year, title, description, NULL AS patent_number, NULL AS inventor_or_owner, sort_order FROM other_publications
      ORDER BY sort_order ASC, id ASC
    `)
    res.json(rows)
  } catch (error) {
    console.error('Admin other works list failed:', error.message)
    res.status(500).json({ error: '無法讀取資料' })
  }
})

router.post('/other_works', async (req, res) => {
  try {
    const definition = resources.other_works
    const values = normalizePayload(definition, req.body)
    const last = await dbGet('SELECT MAX(value) AS value FROM (SELECT COALESCE(MAX(sort_order), -1) AS value FROM patents UNION ALL SELECT COALESCE(MAX(sort_order), -1) FROM other_publications)')
    const sortOrder = Number(last.value) + 1
    let result
    if (values.kind === 'patent') {
      result = await dbRun('INSERT INTO patents (year, title, patent_number, inventor_or_owner, sort_order) VALUES (?, ?, ?, ?, ?)', [values.year, values.title, values.patent_number, values.inventor_or_owner, sortOrder])
      res.status(201).json({ ...values, id: result.id * 2, sort_order: sortOrder })
    } else {
      result = await dbRun('INSERT INTO other_publications (year, title, description, sort_order) VALUES (?, ?, ?, ?)', [values.year, values.title, values.description, sortOrder])
      res.status(201).json({ ...values, id: result.id * 2 + 1, sort_order: sortOrder })
    }
  } catch (error) {
    if (!String(error.message).includes('SQLITE')) return res.status(400).json({ error: error.message })
    console.error('Admin other works create failed:', error.message)
    res.status(500).json({ error: '無法新增資料' })
  }
})

router.put('/other_works/reorder', async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(decodeOtherWorkId) : []
  if (!ids.length || ids.some((item) => !item)) return res.status(400).json({ error: '排序資料無效' })
  try {
    await Promise.all(ids.map((item, index) => dbRun(`UPDATE ${item.table} SET sort_order = ? WHERE id = ?`, [index, item.id])))
    res.status(204).end()
  } catch (error) {
    console.error('Admin other works reorder failed:', error.message)
    res.status(500).json({ error: '無法儲存排序' })
  }
})

router.put('/other_works/:id', async (req, res) => {
  const item = decodeOtherWorkId(req.params.id)
  if (!item) return res.status(400).json({ error: '資料編號無效' })
  try {
    const values = normalizePayload(resources.other_works, req.body)
    const result = item.kind === 'patent'
      ? await dbRun('UPDATE patents SET year = ?, title = ?, patent_number = ?, inventor_or_owner = ? WHERE id = ?', [values.year, values.title, values.patent_number, values.inventor_or_owner, item.id])
      : await dbRun('UPDATE other_publications SET year = ?, title = ?, description = ? WHERE id = ?', [values.year, values.title, values.description, item.id])
    if (!result.changes) return res.status(404).json({ error: '找不到要修改的資料' })
    res.json({ ...values, id: Number(req.params.id) })
  } catch (error) {
    if (!String(error.message).includes('SQLITE')) return res.status(400).json({ error: error.message })
    res.status(500).json({ error: '無法修改資料' })
  }
})

router.delete('/other_works/:id', async (req, res) => {
  const item = decodeOtherWorkId(req.params.id)
  if (!item) return res.status(400).json({ error: '資料編號無效' })
  try {
    const result = await dbRun(`DELETE FROM ${item.table} WHERE id = ?`, [item.id])
    if (!result.changes) return res.status(404).json({ error: '找不到要刪除的資料' })
    res.status(204).end()
  } catch {
    res.status(500).json({ error: '無法刪除資料' })
  }
})

router.get('/:resource', async (req, res) => {
  const definition = getResource(req, res)
  if (!definition) return
  try {
    const fields = ['id', ...definition.fields.map(([name]) => name)]
    const order = definition.fields.some(([name]) => name === 'sort_order') ? ' ORDER BY sort_order ASC, id ASC' : ' ORDER BY id ASC'
    res.json(await dbAll(`SELECT ${fields.join(', ')} FROM ${req.params.resource}${order}`))
  } catch (error) {
    console.error('Admin list failed:', error.message)
    res.status(500).json({ error: '無法讀取資料' })
  }
})

router.post('/upload', async (req, res) => {
  const mimeType = String(req.body?.mimeType || '')
  const extension = allowedImages[mimeType]
  const encoded = String(req.body?.data || '')
  if (!extension || !encoded) return res.status(400).json({ error: '僅支援 JPG、PNG、WebP 或 GIF 圖片' })

  let contents
  try {
    contents = Buffer.from(encoded, 'base64')
  } catch {
    return res.status(400).json({ error: '圖片資料無效' })
  }
  if (!contents.length || contents.length > 5 * 1024 * 1024) return res.status(400).json({ error: '圖片大小不可超過 5 MB' })

  try {
    await fs.mkdir(uploadDirectory, { recursive: true })
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`
    await fs.writeFile(path.join(uploadDirectory, fileName), contents, { flag: 'wx' })
    res.status(201).json({ path: `/uploads/${fileName}` })
  } catch (error) {
    console.error('Image upload failed:', error.message)
    res.status(500).json({ error: '圖片上傳失敗' })
  }
})

router.post('/:resource', async (req, res) => {
  const definition = getResource(req, res)
  if (!definition) return
  if (definition.singleton) return res.status(405).json({ error: '固定內容不可新增' })
  try {
    const values = normalizePayload(definition, req.body)
    if (definition.fields.some(([name]) => name === 'sort_order')) {
      const last = await dbGet(`SELECT COALESCE(MAX(sort_order), -1) AS value FROM ${req.params.resource}`)
      values.sort_order = Number(last.value) + 1
    }
    if (definition.labChild) {
      const lab = await dbGet('SELECT id FROM labs ORDER BY id ASC LIMIT 1')
      if (!lab) return res.status(409).json({ error: '請先建立實驗室資料' })
      values.lab_id = lab.id
    }
    const columns = Object.keys(values)
    const result = await dbRun(`INSERT INTO ${req.params.resource} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, Object.values(values))
    res.status(201).json(await dbGet(`SELECT * FROM ${req.params.resource} WHERE id = ?`, [result.id]))
  } catch (error) {
    if (!String(error.message).includes('SQLITE')) return res.status(400).json({ error: error.message })
    console.error('Admin create failed:', error.message)
    res.status(500).json({ error: '無法新增資料' })
  }
})

router.put('/:resource/reorder', async (req, res) => {
  const definition = getResource(req, res)
  if (!definition) return
  if (!definition.fields.some(([name]) => name === 'sort_order')) return res.status(405).json({ error: '這個項目不支援排序' })
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : []
  if (!ids.length || ids.some((id) => !Number.isInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
    return res.status(400).json({ error: '排序資料無效' })
  }
  try {
    const cases = ids.map(() => 'WHEN ? THEN ?').join(' ')
    const parameters = ids.flatMap((id, index) => [id, index])
    await dbRun(`UPDATE ${req.params.resource} SET sort_order = CASE id ${cases} ELSE sort_order END WHERE id IN (${ids.map(() => '?').join(', ')})`, [...parameters, ...ids])
    res.status(204).end()
  } catch (error) {
    console.error('Admin reorder failed:', error.message)
    res.status(500).json({ error: '無法儲存排序' })
  }
})

router.put('/:resource/:id', async (req, res) => {
  const definition = getResource(req, res)
  if (!definition) return
  try {
    const values = normalizePayload(definition, req.body)
    const columns = Object.keys(values)
    const result = await dbRun(`UPDATE ${req.params.resource} SET ${columns.map((name) => `${name} = ?`).join(', ')} WHERE id = ?`, [...Object.values(values), req.params.id])
    if (!result.changes) return res.status(404).json({ error: '找不到要修改的資料' })
    res.json(await dbGet(`SELECT * FROM ${req.params.resource} WHERE id = ?`, [req.params.id]))
  } catch (error) {
    if (!String(error.message).includes('SQLITE')) return res.status(400).json({ error: error.message })
    console.error('Admin update failed:', error.message)
    res.status(500).json({ error: '無法修改資料' })
  }
})

router.delete('/:resource/:id', async (req, res) => {
  const definition = getResource(req, res)
  if (!definition) return
  if (definition.singleton) return res.status(405).json({ error: '固定內容不可刪除' })
  try {
    const result = await dbRun(`DELETE FROM ${req.params.resource} WHERE id = ?`, [req.params.id])
    if (!result.changes) return res.status(404).json({ error: '找不到要刪除的資料' })
    res.status(204).end()
  } catch (error) {
    console.error('Admin delete failed:', error.message)
    res.status(500).json({ error: '無法刪除資料' })
  }
})

export default router

import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sqlite3 from 'sqlite3'

const databasePath = fileURLToPath(new URL('../server/sqlite.db', import.meta.url))
const outputPath = new URL('../migrations/0002_content.sql', import.meta.url)
const tables = {
  navigation_items: ['id', 'name', 'path', 'sort_order', 'is_visible'],
  site_settings: ['key', 'value'],
  content_groups: ['id', 'section', 'key', 'title', 'short_title', 'label', 'sort_order'],
  profile: ['id', 'name_zh', 'name_en', 'email', 'address', 'short_bio', 'full_bio'],
  positions: ['id', 'title', 'organization', 'department', 'sort_order'],
  research_areas: ['id', 'title', 'sort_order'],
  labs: ['id', 'name', 'description'],
  research_interests: ['id', 'title', 'sort_order'],
  research: ['id', 'title', 'description', 'photo', 'photo_position', 'sort_order'],
  research_summaries: ['id', 'text', 'sort_order'],
  journal_papers: ['id', 'year', 'authors', 'title', 'journal', 'doi_url', 'photo', 'photo_position', 'sort_order'],
  conference_papers: ['id', 'year', 'authors', 'title', 'conference', 'photo', 'photo_position', 'sort_order'],
  other_publications: ['id', 'year', 'title', 'description', 'sort_order'],
  patents: ['id', 'year', 'title', 'patent_number', 'inventor_or_owner', 'sort_order'],
  projects: ['id', 'period', 'title', 'organization', 'role', 'status', 'photo', 'photo_position', 'sort_order'],
  collaboration_projects: ['id', 'text', 'sort_order'],
  experiences: ['id', 'period', 'organization', 'position', 'sort_order'],
  experience_items: ['id', 'type', 'text', 'sort_order'],
  international_items: ['id', 'type', 'text', 'sort_order'],
  lab_members: ['id', 'lab_id', 'name', 'sort_order'],
  research_topics: ['id', 'lab_id', 'topic', 'sort_order'],
  lab_activities: ['id', 'lab_id', 'title', 'sort_order'],
}

const db = new sqlite3.Database(databasePath)
const all = (sql) => new Promise((resolve, reject) => db.all(sql, [], (error, rows) => error ? reject(error) : resolve(rows)))
const quote = (value) => value == null ? 'NULL' : typeof value === 'number' ? String(value) : `'${String(value).replaceAll("'", "''")}'`
const statements = []

for (const [table, columns] of Object.entries(tables)) {
  const rows = await all(`SELECT ${columns.join(', ')} FROM ${table}`)
  if (!rows.length) continue
  for (const row of rows) statements.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((column) => quote(row[column])).join(', ')});`)
}

statements.push('')
await fs.writeFile(outputPath, statements.join('\n'), 'utf8')
db.close()
console.log(`Exported current SQLite content to ${outputPath.pathname}`)

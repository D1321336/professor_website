import db from './db.js'

const tables = [
  'navigation_items',
  'profile',
  'positions',
  'research_areas',
  'labs',
  'research_interests',
  'research',
  'research_summaries',
  'journal_papers',
  'conference_papers',
  'other_publications',
  'patents',
  'projects',
  'collaboration_projects',
  'experiences',
  'experience_items',
  'international_items',
  'lab_members',
  'research_topics',
  'lab_activities',
]

console.log('\n=== Database Check ===\n')

db.serialize(() => {
  tables.forEach((table) => {
    db.get(`SELECT COUNT(*) AS count FROM ${table}`, (err, row) => {
      if (err) {
        console.error(`❌ ${table}: ${err.message}`)
        return
      }

      console.log(`${table.padEnd(25)} ${row.count}`)
    })
  })
})

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message)
    return
  }

  console.log('\nDatabase check completed.')
})

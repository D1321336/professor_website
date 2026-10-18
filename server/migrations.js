import db from './db.js'

const mediaColumns = [
  ['research', 'photo'],
  ['research', 'photo_position'],
  ['journal_papers', 'photo'],
  ['journal_papers', 'photo_position'],
  ['conference_papers', 'photo'],
  ['conference_papers', 'photo_position'],
  ['projects', 'photo'],
  ['projects', 'photo_position'],
]

export function initializeContentMedia() {
  const addMediaColumns = mediaColumns.map(([table, column]) => new Promise((resolve) => {
      db.all(`PRAGMA table_info(${table})`, [], (infoError, columns) => {
        if (infoError) {
          console.error(`Unable to inspect ${table}:`, infoError.message)
          resolve()
          return
        }
        if (columns.some((item) => item.name === column)) {
          resolve()
          return
        }
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} TEXT`, (alterError) => {
          if (alterError) console.error(`Unable to add ${table}.${column}:`, alterError.message)
          resolve()
        })
      })
  }))

  const removeProfilePhoto = new Promise((resolve) => {
    db.all('PRAGMA table_info(profile)', [], (infoError, columns) => {
      if (infoError) {
        console.error('Unable to inspect profile:', infoError.message)
        resolve()
        return
      }
      if (!columns.some((item) => item.name === 'photo')) {
        resolve()
        return
      }
      db.run('ALTER TABLE profile DROP COLUMN photo', (dropError) => {
        if (dropError) console.error('Unable to remove profile.photo:', dropError.message)
        resolve()
      })
    })
  })

  return Promise.all([...addMediaColumns, removeProfilePhoto])
}

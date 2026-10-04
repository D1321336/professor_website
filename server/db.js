import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('server/sqlite.db', (err) => {
  if (err) {
    return console.error(err.message)
  }

  console.log('Connected to the SQLite database.')
})

export default db

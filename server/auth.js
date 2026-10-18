import crypto from 'node:crypto'
import db from './db.js'

const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const sessions = new Map()
const loginAttempts = new Map()
let adminConfigured = false

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHex] = String(storedHash || '').split(':')
  if (!salt || !expectedHex) return false
  const actual = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(expectedHex, 'hex')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

export function initializeAdmin() {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `, (tableError) => {
      if (tableError) {
        console.error('Unable to initialize admin users:', tableError.message)
        resolve()
        return
      }

      const username = process.env.ADMIN_USERNAME?.trim()
      const password = process.env.ADMIN_PASSWORD
      if (!username || !password) {
        adminConfigured = false
        console.warn('Admin login is disabled. Set ADMIN_USERNAME and ADMIN_PASSWORD.')
        resolve()
        return
      }

      adminConfigured = true
      const passwordHash = hashPassword(password)
      db.serialize(() => {
        db.run('DELETE FROM admin_users WHERE username <> ?', [username])
        db.run(
          `INSERT INTO admin_users (username, password_hash, updated_at)
           VALUES (?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP`,
          [username, passwordHash],
          (error) => {
            if (error) console.error('Unable to configure administrator:', error.message)
            else console.log(`Administrator "${username}" is configured.`)
            resolve()
          },
        )
      })
    })
  })
}

export function canAttemptLogin(key) {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  record.count += 1
  return record.count <= 10
}

export function clearLoginAttempts(key) {
  loginAttempts.delete(key)
}

export function authenticate(username, password) {
  if (!adminConfigured) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username, password_hash FROM admin_users WHERE username = ?', [username], (error, user) => {
      if (error) return reject(error)
      if (!user || !verifyPassword(password, user.password_hash)) return resolve(null)

      const token = crypto.randomBytes(32).toString('hex')
      sessions.set(token, {
        userId: user.id,
        username: user.username,
        expiresAt: Date.now() + SESSION_TTL_MS,
      })
      resolve({ token, username: user.username, expiresIn: SESSION_TTL_MS / 1000 })
    })
  })
}

export function requireAdmin(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
  const session = token ? sessions.get(token) : null
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token)
    return res.status(401).json({ error: '請重新登入管理後台' })
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS
  req.admin = session
  req.adminToken = token
  next()
}

export function revokeSession(token) {
  sessions.delete(token)
}

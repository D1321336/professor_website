import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const profileSql = `
    SELECT
      id,
      name_zh,
      name_en,
      email,
      address,
      short_bio,
      photo
    FROM profile
    LIMIT 1
  `

  const positionsSql = `
    SELECT
      id,
      title,
      organization,
      department,
      sort_order
    FROM positions
    ORDER BY sort_order ASC
  `

  const researchAreasSql = `
    SELECT
      id,
      title,
      sort_order
    FROM research_areas
    ORDER BY sort_order ASC
  `

  const navigationSql = `
    SELECT id, name, path, sort_order
    FROM navigation_items
    WHERE is_visible = 1
    ORDER BY sort_order ASC
  `

  const settingsSql = `SELECT key, value FROM site_settings`

  const groupsSql = `
    SELECT id, section, key, title, short_title, label, sort_order
    FROM content_groups
    ORDER BY section ASC, sort_order ASC
  `

  db.get(profileSql, [], (profileErr, profile) => {
    if (profileErr) {
      console.error('Error getting profile:', profileErr.message)
      return res.status(500).json({
        error: 'Failed to get profile',
      })
    }

    db.all(positionsSql, [], (positionsErr, positions) => {
      if (positionsErr) {
        console.error('Error getting positions:', positionsErr.message)
        return res.status(500).json({
          error: 'Failed to get positions',
        })
      }

      db.all(researchAreasSql, [], (researchErr, researchAreas) => {
        if (researchErr) {
          console.error(
            'Error getting research areas:',
            researchErr.message,
          )

          return res.status(500).json({
            error: 'Failed to get research areas',
          })
        }

        db.all(navigationSql, [], (navigationErr, navigationItems) => {
          if (navigationErr) return res.status(500).json({ error: 'Failed to get navigation' })

          db.all(settingsSql, [], (settingsErr, settingRows) => {
            if (settingsErr) return res.status(500).json({ error: 'Failed to get site settings' })

            db.all(groupsSql, [], (groupsErr, contentGroups) => {
              if (groupsErr) return res.status(500).json({ error: 'Failed to get content groups' })

              res.json({
                profile,
                positions,
                research_areas: researchAreas,
                navigation_items: navigationItems,
                settings: Object.fromEntries(settingRows.map((row) => [row.key, row.value])),
                content_groups: contentGroups,
              })
            })
          })
        })
      })
    })
  })
})

export default router

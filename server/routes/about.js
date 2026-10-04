import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const profileSql = `
    SELECT
      id,
      name_zh,
      name_en,
      full_bio,
      photo
    FROM profile
    LIMIT 1
  `

  const researchInterestsSql = `
    SELECT
      id,
      title,
      sort_order
    FROM research_interests
    ORDER BY sort_order ASC
  `

  db.get(profileSql, [], (profileErr, profile) => {
    if (profileErr) {
      console.error('Error getting profile:', profileErr.message)

      return res.status(500).json({
        error: 'Failed to get profile',
      })
    }

    db.all(
      researchInterestsSql,
      [],
      (researchErr, researchInterests) => {
        if (researchErr) {
          console.error(
            'Error getting research interests:',
            researchErr.message,
          )

          return res.status(500).json({
            error: 'Failed to get research interests',
          })
        }

        res.json({
          profile,
          research_interests: researchInterests,
        })
      },
    )
  })
})

export default router

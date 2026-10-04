import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const experiencesSql = `
    SELECT
      id,
      period,
      organization,
      position,
      sort_order
    FROM experiences
    ORDER BY sort_order ASC
  `

  const experienceItemsSql = `
    SELECT
      id,
      type,
      text,
      sort_order
    FROM experience_items
    ORDER BY sort_order ASC
  `

  db.all(experiencesSql, [], (experiencesErr, experiences) => {
    if (experiencesErr) {
      console.error(
        'Error getting experiences:',
        experiencesErr.message,
      )

      return res.status(500).json({
        error: 'Failed to get experiences',
      })
    }

    db.all(
      experienceItemsSql,
      [],
      (itemsErr, experienceItems) => {
        if (itemsErr) {
          console.error(
            'Error getting experience items:',
            itemsErr.message,
          )

          return res.status(500).json({
            error: 'Failed to get experience items',
          })
        }

        const professionalService = experienceItems.filter(
          (item) => item.type === 'professional_service',
        )

        const teaching = experienceItems.filter(
          (item) => item.type === 'teaching',
        )

        const training = experienceItems.filter(
          (item) => item.type === 'training',
        )

        res.json({
          experiences,
          experience_items: {
            professional_service: professionalService,
            teaching,
            training,
          },
        })
      },
    )
  })
})

export default router

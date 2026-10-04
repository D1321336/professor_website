import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const sql = `
    SELECT
      id,
      type,
      text,
      sort_order
    FROM international_items
    ORDER BY sort_order ASC
  `

  db.all(sql, [], (err, internationalItems) => {
    if (err) {
      console.error(
        'Error getting international items:',
        err.message,
      )

      return res.status(500).json({
        error: 'Failed to get international items',
      })
    }

    const visitExchange = internationalItems.filter(
      (item) => item.type === 'visit_exchange',
    )

    const approvedCooperation = internationalItems.filter(
      (item) => item.type === 'approved_cooperation',
    )

    const developingCooperation = internationalItems.filter(
      (item) => item.type === 'developing_cooperation',
    )

    res.json({
      visit_exchange: visitExchange,
      approved_cooperation: approvedCooperation,
      developing_cooperation: developingCooperation,
    })
  })
})

export default router

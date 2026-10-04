import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const researchSql = `
    SELECT
      id,
      title,
      description,
      sort_order
    FROM research
    ORDER BY sort_order ASC
  `

  const summariesSql = `
    SELECT
      id,
      text,
      sort_order
    FROM research_summaries
    ORDER BY sort_order ASC
  `

  db.all(researchSql, [], (researchErr, research) => {
    if (researchErr) {
      console.error('Error getting research:', researchErr.message)

      return res.status(500).json({
        error: 'Failed to get research',
      })
    }

    db.all(summariesSql, [], (summaryErr, researchSummaries) => {
      if (summaryErr) {
        console.error(
          'Error getting research summaries:',
          summaryErr.message,
        )

        return res.status(500).json({
          error: 'Failed to get research summaries',
        })
      }

      res.json({
        research,
        research_summaries: researchSummaries,
      })
    })
  })
})

export default router

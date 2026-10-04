import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const journalSql = `
    SELECT
      id,
      year,
      authors,
      title,
      journal,
      doi_url,
      sort_order
    FROM journal_papers
    ORDER BY year DESC, sort_order ASC
  `

  const conferenceSql = `
    SELECT
      id,
      year,
      authors,
      title,
      conference,
      sort_order
    FROM conference_papers
    ORDER BY year DESC, sort_order ASC
  `

  const otherSql = `
    SELECT
      id,
      year,
      title,
      description,
      sort_order
    FROM other_publications
    ORDER BY year DESC, sort_order ASC
  `

  const patentSql = `
    SELECT
      id,
      year,
      title,
      patent_number,
      inventor_or_owner,
      sort_order
    FROM patents
    ORDER BY year DESC, sort_order ASC
  `

  db.all(journalSql, [], (journalErr, journalPapers) => {
    if (journalErr) {
      console.error('Error getting journal papers:', journalErr.message)

      return res.status(500).json({
        error: 'Failed to get journal papers',
      })
    }

    db.all(conferenceSql, [], (conferenceErr, conferencePapers) => {
      if (conferenceErr) {
        console.error('Error getting conference papers:', conferenceErr.message)

        return res.status(500).json({
          error: 'Failed to get conference papers',
        })
      }

      db.all(otherSql, [], (otherErr, otherPublications) => {
        if (otherErr) {
          console.error('Error getting other publications:', otherErr.message)

          return res.status(500).json({
            error: 'Failed to get other publications',
          })
        }

        db.all(patentSql, [], (patentErr, patents) => {
          if (patentErr) {
            console.error('Error getting patents:', patentErr.message)

            return res.status(500).json({
              error: 'Failed to get patents',
            })
          }

          res.json({
            journal_papers: journalPapers,
            conference_papers: conferencePapers,
            other_publications: otherPublications,
            patents,
          })
        })
      })
    })
  })
})

export default router

import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const projectsSql = `
    SELECT
      id,
      period,
      title,
      organization,
      role,
      status,
      sort_order
    FROM projects
    ORDER BY sort_order ASC
  `

  const collaborationSql = `
    SELECT
      id,
      text,
      sort_order
    FROM collaboration_projects
    ORDER BY sort_order ASC
  `

  db.all(projectsSql, [], (projectsErr, projects) => {
    if (projectsErr) {
      console.error('Error getting projects:', projectsErr.message)

      return res.status(500).json({
        error: 'Failed to get projects',
      })
    }

    db.all(
      collaborationSql,
      [],
      (collaborationErr, collaborationProjects) => {
        if (collaborationErr) {
          console.error(
            'Error getting collaboration projects:',
            collaborationErr.message,
          )

          return res.status(500).json({
            error: 'Failed to get collaboration projects',
          })
        }

        res.json({
          projects,
          collaboration_projects: collaborationProjects,
        })
      },
    )
  })
})

export default router

import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const labSql = `
    SELECT
      id,
      name,
      description,
      photo
    FROM labs
    LIMIT 1
  `

  db.get(labSql, [], (labErr, lab) => {
    if (labErr) {
      console.error('Error getting lab:', labErr.message)

      return res.status(500).json({
        error: 'Failed to get lab',
      })
    }

    if (!lab) {
      return res.status(404).json({
        error: 'Lab not found',
      })
    }

    const researchTopicsSql = `
      SELECT
        id,
        topic,
        sort_order
      FROM research_topics
      WHERE lab_id = ?
      ORDER BY sort_order ASC
    `

    const labMembersSql = `
      SELECT
        id,
        name,
        sort_order
      FROM lab_members
      WHERE lab_id = ?
      ORDER BY sort_order ASC
    `

    const labActivitiesSql = `
      SELECT
        id,
        title,
        sort_order
      FROM lab_activities
      WHERE lab_id = ?
      ORDER BY sort_order ASC
    `

    db.all(
      researchTopicsSql,
      [lab.id],
      (topicsErr, researchTopics) => {
        if (topicsErr) {
          console.error(
            'Error getting research topics:',
            topicsErr.message,
          )

          return res.status(500).json({
            error: 'Failed to get research topics',
          })
        }

        db.all(
          labMembersSql,
          [lab.id],
          (membersErr, labMembers) => {
            if (membersErr) {
              console.error(
                'Error getting lab members:',
                membersErr.message,
              )

              return res.status(500).json({
                error: 'Failed to get lab members',
              })
            }

            db.all(
              labActivitiesSql,
              [lab.id],
              (activitiesErr, labActivities) => {
                if (activitiesErr) {
                  console.error(
                    'Error getting lab activities:',
                    activitiesErr.message,
                  )

                  return res.status(500).json({
                    error: 'Failed to get lab activities',
                  })
                }

                res.json({
                  lab,
                  research_topics: researchTopics,
                  lab_members: labMembers,
                  lab_activities: labActivities,
                })
              },
            )
          },
        )
      },
    )
  })
})

export default router

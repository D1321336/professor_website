import express from 'express'
import homeRouter from './routes/home.js'
import aboutRouter from './routes/about.js'
import researchRouter from './routes/research.js'
import publicationsRouter from './routes/publications.js'
import projectsRouter from './routes/projects.js'
import experienceRouter from './routes/experience.js'
import internationalRouter from './routes/international.js'
import labRouter from './routes/lab.js'

const app = express()
const PORT = 3000

app.use(express.json())

// Test API
app.get('/api', (req, res) => {
  res.json({
    message: 'Professor Website API is running',
  })
})

// Routes
app.use('/api/home', homeRouter)
app.use('/api/about', aboutRouter)
app.use('/api/research', researchRouter)
app.use('/api/publications', publicationsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/experience', experienceRouter)
app.use('/api/international', internationalRouter)
app.use('/api/lab', labRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

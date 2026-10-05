import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import homeRouter from './routes/home.js'
import aboutRouter from './routes/about.js'
import researchRouter from './routes/research.js'
import publicationsRouter from './routes/publications.js'
import projectsRouter from './routes/projects.js'
import experienceRouter from './routes/experience.js'
import internationalRouter from './routes/international.js'
import labRouter from './routes/lab.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3000

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

// Serve the built Vue frontend
app.use(express.static(path.join(__dirname, '../dist')))

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

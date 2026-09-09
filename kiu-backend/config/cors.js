const logger = require('../logger')

const PRODUCTION_ORIGIN = process.env.FRONTEND_URL || 'https://kiu-university.vercel.app'
// Preview deploy domenlari: kiu-website-<hash>-xcoder13s-projects.vercel.app
const PREVIEW_ORIGIN_RE = /^https:\/\/kiu-website-[a-z0-9]+-xcoder13s-projects\.vercel\.app$/

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // server-to-server / curl / Postman
    if (origin === PRODUCTION_ORIGIN || PREVIEW_ORIGIN_RE.test(origin)) {
      return callback(null, true)
    }
    logger.warn({ origin }, '[CORS] Bloklandi — ruxsatsiz origin')
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

module.exports = { corsOptions, PRODUCTION_ORIGIN, PREVIEW_ORIGIN_RE }

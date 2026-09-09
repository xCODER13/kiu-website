const News = require('../models/News')
const Event = require('../models/Event')
const Teacher = require('../models/Teacher')
const Application = require('../models/Application')
const { fail } = require('../middleware/errorHandler')

async function getStats(req, res) {
  try {
    const admFilter = { type: 'admission' }
    const [newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps] = await Promise.all([
      News.countDocuments(),
      Event.countDocuments(),
      Teacher.countDocuments(),
      Application.countDocuments(admFilter),
      Application.countDocuments({ status: 'new' }),
      Application.countDocuments({ type: 'vacancy' }),
    ])
    res.json({ newsCount, eventsCount, teachersCount, appsCount, newApps, vacancyApps })
  } catch (e) { fail(req, res, 500, e) }
}

module.exports = { getStats }
const Event = require('../models/Event')
const { fail } = require('../middleware/errorHandler')
const { applyPagination } = require('../utils/pagination')

async function getAll(req, res) {
  try {
    const q = Event.find().sort({ createdAt: -1 })
    applyPagination(q, req.query)
    res.json(await q)
  } catch (e) { fail(req, res, 500, e) }
}

async function create(req, res) {
  try { res.json(await Event.create(req.body)) }
  catch (e) { fail(req, res, 400, e) }
}

async function update(req, res) {
  try { res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (e) { fail(req, res, 400, e) }
}

async function remove(req, res) {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ success: true }) }
  catch (e) { fail(req, res, 500, e) }
}

module.exports = { getAll, create, update, remove }
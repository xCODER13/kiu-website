const mongose = require('mongoose')

const pageViewSchema = new mongose.Schema({
    page: { type: String, required: true },
    count: { type: Number, default: 0 }
})
module.exports = mongose.model('PageView', pageViewSchema)
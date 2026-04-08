const mongoose = require('mongoose')

const ApplicationSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  phone:      { type: String, required: true },
  faculty:    { type: String, default: '' },
  message:    { type: String, default: '' },
  email:      { type: String, default: '' },
  position:   { type: String, default: '' },
  education:  { type: String, default: '' },
  experience: { type: String, default: '' },
  type:       { type: String, default: 'admission', enum: ['admission', 'vacancy'] },
  status:     { type: String, default: 'new', enum: ['new', 'reviewed', 'accepted', 'rejected'] },
}, { timestamps: true })

module.exports = mongoose.model('Application', ApplicationSchema)
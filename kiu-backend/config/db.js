const mongoose = require('mongoose')
const logger = require('../logger')

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI)
  logger.info('MongoDB ulandi')

  const setting = await mongoose.connection.db.collection('settings').findOne({ key: 'admin_password_hash' })
  if (setting?.value) {
    process.env.ADMIN_PASSWORD_HASH = setting.value
    logger.info('Admin parol hash yuklandi')
  }
}

module.exports = { connectDB }
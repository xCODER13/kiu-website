const mongoose = require('mongoose')
const logger = require('../logger')

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI)
  logger.info('MongoDB ulandi')

  const [hashSetting, changedAtSetting] = await Promise.all([
    mongoose.connection.db.collection('settings').findOne({ key: 'admin_password_hash' }),
    mongoose.connection.db.collection('settings').findOne({ key: 'admin_password_changed_at' }),
  ])
  if (hashSetting?.value) {
    process.env.ADMIN_PASSWORD_HASH = hashSetting.value
    logger.info('Admin parol hash yuklandi')
  }
  if (changedAtSetting?.value) {
    process.env.ADMIN_PASSWORD_CHANGED_AT = changedAtSetting.value
  }
}

module.exports = { connectDB }
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  // mongodb-memory-server bitta umumiy Mongo nusxasini ishlatadi — testlar
  // parallel emas, ketma-ket ishga tushirilsa (--runInBand, ko'r: package.json "test" script) 
  // race condition bo'lmaydi.
  testTimeout: 30000, // MongoDB binary birinchi marta yuklanganda vaqt olishi mumkin
  verbose: true,
}
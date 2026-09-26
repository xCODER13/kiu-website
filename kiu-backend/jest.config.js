module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/globalSetup.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  // Docker orqali local Mongo (127.0.0.1:27017) ishlatiladi — memory-server emas.
 // parallel emas, ketma-ket ishga tushiriladi (--runInBand, ko'r: package.json "test" script)
 // race condition bo'lmaydi.
  testTimeout: 30000, // MongoDB binary birinchi marta yuklanganda vaqt olishi mumkin
  verbose: true,
}
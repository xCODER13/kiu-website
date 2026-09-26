import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    env: { VITE_API_URL: 'http://api.test' },
    // Har testdan keyin spy/stub'lar avtomatik tiklanadi — testlar bir-biriga ta'sir qilmasin
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    environmentMatchGlobs: [
      ['src/**/*.test.*', 'happy-dom'],
      ['tests/**/*.test.*', 'node'],
    ],
  },
})

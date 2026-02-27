import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import ViteFonts from 'vite-plugin-fonts'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      fastRefresh: mode !== 'test'
    }),
    ViteFonts({
      google: {
        families: [{ name: 'Crimson Text', styles: 'wght@400;700' }]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    exclude: ['e2e/**', 'node_modules/**']
  }
}))

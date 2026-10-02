import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/predict': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/model-info': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/rules': 'http://localhost:8000',
      '/cases': 'http://localhost:8000',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})

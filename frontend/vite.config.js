import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, el proxy redirige /api al backend Express
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    // El build va directamente a la carpeta que Express sirve como estáticos
    outDir: '../backend/public',
    emptyOutDir: true,
  },
})

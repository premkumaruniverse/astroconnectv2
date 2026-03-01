import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://3.27.248.57:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://3.27.248.57:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://3.27.248.57:8000',
        ws: true,
      },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})


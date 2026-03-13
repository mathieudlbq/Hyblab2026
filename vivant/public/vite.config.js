import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  base: '/vivant/',
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      // Redirige localhost:5173/api vers localhost:3000/api
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    host : true
  },
})
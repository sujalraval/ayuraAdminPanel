import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5174,
    proxy: {
      '/api': "http://localhost:5000",
      '/uploads': 'http://localhost:5000'
    },
    fs: {
      allow: ['..']
    },
    historyApiFallback: true // ✅ ADD THIS LINE
  },
  build: {
    sourcemap: false
  }
});
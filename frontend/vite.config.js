import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Combined Vite config: React + Tailwind plugin + dev proxy for backend
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // proxy socket.io websocket connections
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
})

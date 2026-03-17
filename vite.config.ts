import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 7000,
    host: '127.0.0.1',
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      clientPort: 7000,
      protocol: 'ws',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts', 'react-is'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})

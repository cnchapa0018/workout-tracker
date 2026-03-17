import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    port: 7000,
    https: true,
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

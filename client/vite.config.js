import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ✅ Add this line block
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, 
      },
      manifest: {
        name: 'Shop Smart Grocery Web App',
        short_name: 'Shop Smart By Badri',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/shopsmartlogo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/shopsmartlogo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})

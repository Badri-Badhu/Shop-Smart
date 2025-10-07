import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Shop Smart Grocery Web App',          
        short_name: 'Shop Smart By Badri',            
        start_url: '/',                   
        display: 'standalone',            
        background_color: '#ffffff',      
        theme_color: '#ffffff',           
        icons: [
          {
            src: "/shopsmarticon.png",
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/shopsmarticon.png',
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

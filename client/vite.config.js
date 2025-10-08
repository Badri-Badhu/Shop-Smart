import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, 
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 
      },
      devOptions: {
        enabled: true,
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
});

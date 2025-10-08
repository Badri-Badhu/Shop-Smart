import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // ❌ Disable inline manifest
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true, // Allows PWA testing in dev
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

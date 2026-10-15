import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.webmanifest',
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      },
      manifest: {
        name: 'NutriPlan PWA',
        short_name: 'NutriPlan',
        description: 'Planificador nutricional y de entrenamiento',
        start_url: '/nutri-planner/',
        scope: '/nutri-planner/',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/nutri-planner/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/nutri-planner/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/nutri-planner/'
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'NutriPlan PWA',
        short_name: 'NutriPlan',
        description: 'Planificador nutricional y de entrenamiento',
        start_url: './',
        scope: './',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'icons.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/nutri-planner/'
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      manifest: {
        name: 'Bethel Cell Leaders',
        short_name: 'Cell Groups',
        description: 'Helps Cell Leaders guide families in spiritual growth. Supports weekly Thursday prayer meetings, encourages punctuality, and maintains unity within the group.',
        theme_color: '#4E7D58',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 2000
  }
})

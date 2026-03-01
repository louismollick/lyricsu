import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      outDir: '.output/public',
      manifest: {
        name: 'Lyricsu',
        short_name: 'Lyricsu',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#020617',
        description:
          'Mobile-first Japanese music listening app with synced lyrics and Yomitan lookup.',
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // TanStack Start SSR does not emit a static HTML shell into the precache.
        // Disabling navigation fallback avoids Workbox's non-precached-url error.
        navigateFallback: undefined,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/search') ||
              url.pathname.startsWith('/api/lyrics'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lyricsu-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/media/stream'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})

export default config

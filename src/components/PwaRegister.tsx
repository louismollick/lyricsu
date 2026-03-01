import { useEffect } from 'react'

const SW_MIGRATION_KEY = 'lyricsu-sw-migration-v1'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    async function migrateLegacyServiceWorkers() {
      if (window.localStorage.getItem(SW_MIGRATION_KEY) === 'done') {
        return
      }

      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))

        const cacheKeys = await caches.keys()
        const workboxKeys = cacheKeys.filter(
          (key) =>
            key.startsWith('workbox-') ||
            key.includes('precache') ||
            key.includes('runtime'),
        )
        await Promise.all(workboxKeys.map((key) => caches.delete(key)))
      } catch {
        // Best effort cleanup: do not block app startup if unsupported.
      } finally {
        window.localStorage.setItem(SW_MIGRATION_KEY, 'done')
      }
    }

    void (async () => {
      await migrateLegacyServiceWorkers()

      const { registerSW } = await import('virtual:pwa-register')
      registerSW({ immediate: true })
    })()
  }, [])

  return null
}

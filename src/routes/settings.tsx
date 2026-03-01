import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import {
  deleteDictionary,
  getInstalledDictionaries,
  importDictionaryZip,
} from '../lib/yomitan/core'
import type { YomitanDictionarySummary } from '../lib/yomitan/core'
import {
  loadDictionaryPreferences,
  moveDictionaryPreference,
  normalizeDictionaryPreferences,
  saveDictionaryPreferences,
} from '../lib/yomitan/preferences'
import type { DictionaryPreference } from '../lib/yomitan/preferences'
import {
  ALLOWED_RECOMMENDED_DICTIONARY_URLS,
  buildRecommendedDictionaryProxyUrl,
  RECOMMENDED_DICTIONARIES,
} from '../lib/yomitan/recommended-dictionaries'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        redirect: 'follow',
      })
      if (response.ok) {
        return response
      }

      if (response.status >= 500 && attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
        continue
      }

      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
        continue
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch dictionary URL')
}

function SettingsPage() {
  const [dictionaries, setDictionaries] = useState<YomitanDictionarySummary[]>([])
  const [preferences, setPreferences] = useState<DictionaryPreference[]>([])
  const [loading, setLoading] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [installingRecommended, setInstallingRecommended] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    try {
      const installed = await getInstalledDictionaries()
      const normalized = normalizeDictionaryPreferences(
        installed.map((item) => item.title),
        loadDictionaryPreferences(),
      )
      saveDictionaryPreferences(normalized)

      setDictionaries(installed)
      setPreferences(normalized)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const enabledCount = useMemo(
    () => preferences.filter((item) => item.enabled).length,
    [preferences],
  )

  async function installRecommendedDictionaries() {
    setInstallingRecommended(true)
    setError(null)

    let imported = 0
    let failed = 0
    let summaryError: string | null = null

    try {
      for (const url of RECOMMENDED_DICTIONARIES) {
        try {
          if (!ALLOWED_RECOMMENDED_DICTIONARY_URLS.has(url)) {
            throw new Error(`Blocked unapproved recommended dictionary URL: ${url}`)
          }

          const response = await fetchWithRetry(buildRecommendedDictionaryProxyUrl(url))
          const arrayBuffer = await response.arrayBuffer()
          await importDictionaryZip(arrayBuffer)
          imported++
        } catch {
          failed++
        }
      }

      if (failed > 0) {
        summaryError = `Installed ${imported}, failed ${failed} recommended dictionaries.`
      }
    } finally {
      setInstallingRecommended(false)
      await refresh()
      if (summaryError) {
        setError(summaryError)
      }
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_65%)] px-3 pb-8 pt-4 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Yomitan Dictionaries</CardTitle>
            <CardDescription>
              Upload Yomitan dictionary ZIP files, enable/disable, and order priority.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <p>{dictionaries.length} installed</p>
              <p>{enabledCount} enabled</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800">
                Upload ZIP
                <input
                  type="file"
                  multiple
                  accept=".zip"
                  className="hidden"
                  onChange={async (event) => {
                    const files = event.currentTarget.files
                    if (!files?.length) return

                    setInstalling(true)
                    setError(null)

                    try {
                      for (const file of Array.from(files)) {
                        const buffer = await file.arrayBuffer()
                        await importDictionaryZip(buffer)
                      }
                      await refresh()
                    } catch (importError) {
                      setError(importError instanceof Error ? importError.message : String(importError))
                    } finally {
                      setInstalling(false)
                      event.currentTarget.value = ''
                    }
                  }}
                />
              </label>

              <Button type="button" variant="secondary" size="sm" onClick={() => void refresh()}>
                Refresh
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={installingRecommended}
                onClick={() => void installRecommendedDictionaries()}
              >
                {installingRecommended ? 'Installing...' : 'Install recommended dictionaries'}
              </Button>
            </div>

            {loading || installing || installingRecommended ? (
              <p className="text-sm text-slate-400">Working...</p>
            ) : null}

            {error ? (
              <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority and state</CardTitle>
            <CardDescription>
              Higher entries are preferred for term lookup and tokenization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {preferences.length === 0 ? (
              <p className="text-sm text-slate-400">No dictionaries installed yet.</p>
            ) : (
              preferences.map((preference, index) => (
                <div
                  key={preference.title}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-slate-800 bg-slate-900 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{preference.title}</p>
                    <p className="text-xs text-slate-500">priority #{index + 1}</p>
                  </div>

                  <Switch
                    checked={preference.enabled}
                    onCheckedChange={(checked) => {
                      const next = preferences.map((item) =>
                        item.title === preference.title ? { ...item, enabled: checked } : item,
                      )
                      setPreferences(next)
                      saveDictionaryPreferences(next)
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => {
                      const next = moveDictionaryPreference(preferences, index, index - 1)
                      setPreferences(next)
                      saveDictionaryPreferences(next)
                    }}
                  >
                    Up
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === preferences.length - 1}
                    onClick={() => {
                      const next = moveDictionaryPreference(preferences, index, index + 1)
                      setPreferences(next)
                      saveDictionaryPreferences(next)
                    }}
                  >
                    Down
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        await deleteDictionary(preference.title)
                        await refresh()
                      } catch (deleteError) {
                        setError(deleteError instanceof Error ? deleteError.message : String(deleteError))
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

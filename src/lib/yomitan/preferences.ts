export interface DictionaryPreference {
  title: string
  enabled: boolean
}

interface DictionaryPreferenceStore {
  version: 1
  dictionaries: DictionaryPreference[]
}

const STORAGE_KEY = 'lyricsuYomitanDictionaryPreferences'

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadDictionaryPreferences(): DictionaryPreference[] {
  if (!hasStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as Partial<DictionaryPreferenceStore>
    if (!Array.isArray(parsed.dictionaries)) return []

    return parsed.dictionaries.filter(
      (entry): entry is DictionaryPreference =>
        Boolean(entry) &&
        typeof entry.title === 'string' &&
        typeof entry.enabled === 'boolean',
    )
  } catch {
    return []
  }
}

export function saveDictionaryPreferences(preferences: DictionaryPreference[]) {
  if (!hasStorage()) return

  const store: DictionaryPreferenceStore = {
    version: 1,
    dictionaries: preferences,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function normalizeDictionaryPreferences(
  installedTitles: string[],
  existingPreferences: DictionaryPreference[],
) {
  const existingMap = new Map(existingPreferences.map((item) => [item.title, item]))

  return installedTitles.map((title) => ({
    title,
    enabled: existingMap.get(title)?.enabled ?? true,
  }))
}

export function moveDictionaryPreference(
  preferences: DictionaryPreference[],
  fromIndex: number,
  toIndex: number,
) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= preferences.length ||
    toIndex >= preferences.length ||
    fromIndex === toIndex
  ) {
    return preferences
  }

  const next = [...preferences]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

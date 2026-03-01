import type { DictionaryPreference } from './preferences'

export interface YomitanDictionarySummary {
  title: string
  revision: string
  importDate: number
  version: number
  styles?: string
}

export interface YomitanToken {
  text: string
  reading: string
  selectable: boolean
}

type EnabledMap = Map<string, { index: number; priority: number }>

let coreInstance: any | null = null

function ensureBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('Yomitan is only available in the browser')
  }
}

async function getCore() {
  ensureBrowser()
  if (coreInstance) return coreInstance

  const module = await import('yomitan-core')
  const YomitanCore = module.default
  const core = new YomitanCore({
    databaseName: 'lyricsu-yomitan',
    initLanguage: true,
  })

  await core.initialize()
  coreInstance = core
  return coreInstance
}

function toFindTermDictionaryMap(enabledDictionaryMap: EnabledMap) {
  const map = new Map<
    string,
    {
      index: number
      alias: string
      allowSecondarySearches: boolean
      partsOfSpeechFilter: boolean
      useDeinflections: boolean
    }
  >()

  for (const [name, { index }] of enabledDictionaryMap.entries()) {
    map.set(name, {
      index,
      alias: name,
      allowSecondarySearches: false,
      partsOfSpeechFilter: true,
      useDeinflections: true,
    })
  }

  return map
}

export function buildEnabledDictionaryMap(preferences: DictionaryPreference[]) {
  const map: EnabledMap = new Map()

  preferences
    .filter((item) => item.enabled)
    .forEach((item, index) => {
      map.set(item.title, {
        index,
        priority: 0,
      })
    })

  return map
}

export async function getInstalledDictionaries(): Promise<YomitanDictionarySummary[]> {
  const core = await getCore()
  const dictionaries = (await core.getDictionaryInfo()) as YomitanDictionarySummary[]
  return [...dictionaries].sort((a, b) => b.importDate - a.importDate)
}

export async function importDictionaryZip(
  archive: ArrayBuffer,
  onProgress?: (progress: { index: number; count: number }) => void,
) {
  const core = await getCore()
  return core.importDictionary(archive, { onProgress })
}

export async function deleteDictionary(title: string) {
  const core = await getCore()
  await core.deleteDictionary(title)
}

export async function tokenizeText(text: string, enabledDictionaryMap: EnabledMap) {
  const core = await getCore()

  const parsed = (await core.parseText(text, {
    language: 'ja',
    enabledDictionaryMap: toFindTermDictionaryMap(enabledDictionaryMap),
    scanLength: 10,
    searchResolution: 'letter',
    removeNonJapaneseCharacters: false,
    deinflect: true,
    textReplacements: [null],
  })) as Array<{
    content?: Array<Array<{ text?: string; reading?: string; headwords?: unknown[][] }>>
  }>

  const tokens: YomitanToken[] = []

  for (const parseResult of parsed) {
    for (const line of parseResult.content || []) {
      for (const segment of line) {
        const textPart = segment.text?.trim()
        if (!textPart) continue

        tokens.push({
          text: textPart,
          reading: segment.reading || '',
          selectable: Array.isArray(segment.headwords) && segment.headwords.length > 0,
        })
      }
    }
  }

  return tokens
}

export async function lookupTerm(term: string, enabledDictionaryMap: EnabledMap) {
  const core = await getCore()

  return core.findTerms(term, {
    mode: 'group',
    language: 'ja',
    enabledDictionaryMap: toFindTermDictionaryMap(enabledDictionaryMap),
    options: {
      matchType: 'exact',
      deinflect: true,
      removeNonJapaneseCharacters: false,
      searchResolution: 'letter',
    },
  }) as Promise<{ entries: unknown[]; originalTextLength: number }>
}

export async function renderTermEntriesHtml(entries: unknown[]) {
  const core = await getCore()
  const dictionaryInfo = await core.getDictionaryInfo()

  const renderModule = await import('yomitan-core/render')
  const {
    DisplayGenerator,
    DISPLAY_TEMPLATES,
    DISPLAY_CSS,
    NoOpContentManager,
    applyExtensionDisplayDefaults,
    applyPopupTheme,
  } = renderModule as {
    DisplayGenerator: new (doc: Document, contentManager: unknown, templateHtml: string) => any
    DISPLAY_TEMPLATES: string
    DISPLAY_CSS: string
    NoOpContentManager: new () => unknown
    applyExtensionDisplayDefaults: (target: HTMLElement) => void
    applyPopupTheme: (target: HTMLElement, options?: { theme?: 'light' | 'dark' }) => void
  }

  const root = document.createElement('div')
  applyExtensionDisplayDefaults(root)
  applyPopupTheme(root, { theme: 'dark' })

  const generator = new DisplayGenerator(document, new NoOpContentManager(), DISPLAY_TEMPLATES)
  const container = document.createElement('div')

  for (const entry of entries) {
    container.appendChild(generator.createTermEntry(entry, dictionaryInfo))
  }

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>${DISPLAY_CSS}</style><style>html,body{background:#0b1324;color:#d8e2ff;margin:0}body{padding:10px;overflow:auto}a{color:#7dc7ff}</style></head><body>${container.innerHTML}</body></html>`
}

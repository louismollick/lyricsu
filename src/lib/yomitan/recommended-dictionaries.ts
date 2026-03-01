export const RECOMMENDED_DICTIONARIES = [
  'https://github.com/stephenmk/stephenmk.github.io/releases/latest/download/jitendex-yomitan.zip',
  'https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/KANJIDIC_english.zip',
  'https://github.com/Kuuuube/yomitan-dictionaries/raw/main/dictionaries/JPDB_v2.2_Frequency_Kana_2024-10-13.zip',
  'https://github.com/MarvNC/yomichan-dictionaries/raw/master/dl/%5BKanji%5D%20JPDB%20Kanji.zip',
] as const

export const ALLOWED_RECOMMENDED_DICTIONARY_URLS = new Set<string>(RECOMMENDED_DICTIONARIES)

export function buildRecommendedDictionaryProxyUrl(url: string) {
  return `/api/recommended-dictionaries?url=${encodeURIComponent(url)}`
}

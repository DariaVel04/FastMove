export const LANGUAGES = ["en", "fi"] as const

export type Language = (typeof LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = "fastmove.language"

export function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === "fi" || stored === "en") return stored
  } catch {
    return "en"
  }
  return "en"
}

export function storeLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    return
  }
}

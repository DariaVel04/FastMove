import { createContext } from "react"
import type { MessageKey } from "./translations.ts"
import type { Language } from "./types.ts"

export type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
  text: (english: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

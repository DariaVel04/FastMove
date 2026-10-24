import { useEffect, useMemo, useState, type ReactNode } from "react"
import { LanguageContext, type LanguageContextValue } from "./language-state.ts"
import { phrase } from "./phrases.ts"
import { translate } from "./translations.ts"
import { readStoredLanguage, storeLanguage, type Language } from "./types.ts"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  const setLanguage = (next: Language) => {
    storeLanguage(next)
    setLanguageState(next)
  }

  useEffect(() => {
    document.documentElement.lang = language === "fi" ? "fi" : "en"
    document.title = translate(language, "meta.title")
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => translate(language, key, vars),
      text: (english) => phrase(language, english),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}


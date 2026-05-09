import type { LocalizedText } from '../services/mediaContentService'

export type ContentLocale = 'en' | 'ta' | 'si' | 'ar'

const supportedLocales: ContentLocale[] = ['en', 'ta', 'si', 'ar']

export function normalizeContentLocale(value: null | string | undefined): ContentLocale {
  if (!value) {
    return 'en'
  }

  const shortCode = value.toLowerCase().slice(0, 2)

  if (shortCode === 'si') {
    return 'si'
  }

  if (shortCode === 'ta') {
    return 'ta'
  }

  if (shortCode === 'ar') {
    return 'ar'
  }

  return 'en'
}

export function getLocalizedText(value: LocalizedText | null | undefined, locale: ContentLocale, fallback = 'Content unavailable') {
  if (!value) {
    return fallback
  }

  const preferred = value[locale]?.trim()

  if (preferred) {
    return preferred
  }

  for (const code of supportedLocales) {
    const candidate = value[code]?.trim()
    if (candidate) {
      return candidate
    }
  }

  return fallback
}

export function isRtlLocale(locale: ContentLocale) {
  return locale === 'ar'
}

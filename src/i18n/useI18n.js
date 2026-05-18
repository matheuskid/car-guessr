import { ref, computed } from 'vue'
import translations from './translations.js'

// Shared reactive state — same ref across all components
const locale = ref(localStorage.getItem('car-guessr-locale') || 'en')

/**
 * Lightweight i18n composable.
 *
 * Usage:
 *   const { t, locale, toggleLocale } = useI18n()
 *   t('home.easy')              // → "Easy" or "Fácil"
 *   t('daily.noChallenge', { date: '2026-05-12' })  // interpolation
 */
export function useI18n() {
  /**
   * Translate a dot-separated key, with optional interpolation params.
   * Falls back to the key itself if not found.
   */
  const t = (key, params = {}) => {
    const parts = key.split('.')
    let value = translations[locale.value]

    for (const part of parts) {
      if (value == null) break
      value = value[part]
    }

    if (value === undefined) return key

    if (typeof value === 'string') {
      // Replace {param} placeholders
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
    }

    return value
  }

  const toggleLocale = () => {
    locale.value = locale.value === 'en' ? 'pt' : 'en'
    localStorage.setItem('car-guessr-locale', locale.value)
  }

  const setLocale = (l) => {
    locale.value = l
    localStorage.setItem('car-guessr-locale', l)
  }

  return { t, locale, toggleLocale, setLocale }
}

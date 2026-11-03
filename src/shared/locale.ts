/**
 * Languages the pages are translated to. Each one is the first path segment
 * of its pages (/de, /en), so none of them can be used as slug.
 */
export const LOCALES = ['de', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Each language in its own words, for the language switch
 */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};

/**
 * For visitors whose browser asks for none of the {@link LOCALES}
 */
export const DEFAULT_LOCALE: Locale = 'en';

import { defineRouting } from 'next-intl/routing';

import { DEFAULT_LOCALE, LOCALES } from '@/shared/locale';

// A static export has no proxy, so every page needs the locale prefix and the
// language is picked in the browser (see app/(redirect)) or by the function.
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});

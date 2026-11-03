import type { Request } from 'express';

import {
  DEFAULT_LOCALE,
  type Locale,
  LOCALES,
} from '../../../src/shared/locale';

/**
 * Picks the language of the pages we redirect to (/de/error, /en/authorize)
 * from the Accept-Language header of the browser
 *
 * @param {Request} request
 * @return {Locale} one of {@link LOCALES}
 */
export const getLocale = (request: Request): Locale => {
  // Without the header every language is acceptable and the first one would win
  if (!request.headers['accept-language']) {
    return DEFAULT_LOCALE;
  }

  const accepted = request.acceptsLanguages(...LOCALES);
  return LOCALES.find((locale) => locale === accepted) ?? DEFAULT_LOCALE;
};

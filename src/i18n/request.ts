import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import type { Locale } from '@/shared/locale';

import de from '../../messages/de.json';
import en from '../../messages/en.json';
import { routing } from './routing';

// Typed after the German texts, so a key missing in another language fails
const messages: Record<Locale, typeof de> = { de, en };

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    // Root param of app/[locale]/layout.tsx; a static export only builds the
    // known locales, so this keeps pages static without setRequestLocale
    const param = await rootParams.locale();
    if (!hasLocale(routing.locales, param)) {
      notFound();
    }
    locale = param;
  }

  return {
    locale,
    messages: messages[locale],
  };
});

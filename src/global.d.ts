import type messages from '../messages/de.json';
import type { Locale } from './shared/locale';

// Type-checks locales and message keys of next-intl against the German texts
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}

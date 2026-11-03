import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { DEFAULT_LOCALE, LOCALES } from '@/shared/locale';

export const metadata: Metadata = {
  title: 'zeig.li',
};

// A static export has no server to pick the language, so the browser does it
// while the HTML is parsed: / goes to /de or /en. Firebase also serves this
// page for /authorize and /error, the paths the function used to redirect to,
// so those keep their query string and get the locale prefix.
const redirectScript = `{
  const locales = ${JSON.stringify(LOCALES)};
  const preferred = navigator.languages.map((language) => language.split('-')[0].toLowerCase());
  const locale = preferred.find((language) => locales.includes(language)) ?? '${DEFAULT_LOCALE}';
  const path = location.pathname === '/' ? '' : location.pathname;
  location.replace('/' + locale + path + location.search);
}`;

const RedirectLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RedirectLayout;

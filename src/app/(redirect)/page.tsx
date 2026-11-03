import Link from 'next/link';

import { LANGUAGE_NAMES, LOCALES } from '@/shared/locale';

// The layout redirects right away; without JavaScript the visitor picks
const LanguageSelection = () => {
  return (
    <noscript>
      <ul>
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link href={`/${locale}`} prefetch={false}>
              {LANGUAGE_NAMES[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </noscript>
  );
};

export default LanguageSelection;

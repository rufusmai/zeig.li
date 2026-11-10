import { useLocale, useTranslations } from 'next-intl';

import RufusmaiLogo from '@/components/layout/rufusmaiLogo';
import { Link } from '@/i18n/navigation';
import { LANGUAGE_NAMES, LOCALES } from '@/shared/locale';

const Footer = () => {
  const t = useTranslations('Footer');
  const currentLocale = useLocale();

  return (
    <footer className="mt-5 p-2 text-center text-gray-500 dark:text-gray-400">
      <div className="inline-flex items-center">
        {t('by')}
        {/* The branding's logo colours: ink and wing, each for light and dark */}
        <a
          href="https://rufusmai.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="rufusmai"
          className="ml-2 flex items-center text-[#18181b] transition-opacity duration-200 ease-in-out [--brand-wing:#c75a34] hover:opacity-80 dark:text-[#fafafa] dark:[--brand-wing:#d1633d]"
        >
          <RufusmaiLogo aria-hidden="true" className="h-6 w-auto" />
        </a>
      </div>
      <div className="mt-1 text-xs">
        <a
          href="https://github.com/rufusmai/zeig.li"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {t('github')}
        </a>
        <span aria-hidden="true" className="mx-2">
          ·
        </span>
        <span className="space-x-2">
          {LOCALES.map((locale) =>
            locale === currentLocale ? (
              <span
                key={locale}
                lang={locale}
                title={LANGUAGE_NAMES[locale]}
                className="font-semibold"
              >
                {locale.toUpperCase()}
              </span>
            ) : (
              <Link
                key={locale}
                href="/"
                locale={locale}
                hrefLang={locale}
                lang={locale}
                title={LANGUAGE_NAMES[locale]}
                className="hover:underline"
              >
                {locale.toUpperCase()}
              </Link>
            )
          )}
        </span>
      </div>
    </footer>
  );
};

export default Footer;

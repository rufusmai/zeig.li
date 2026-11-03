import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { LANGUAGE_NAMES, LOCALES } from '@/shared/locale';

const Footer = () => {
  const t = useTranslations('Footer');
  const currentLocale = useLocale();

  return (
    <footer className="mt-5 p-2 text-center text-gray-500 dark:text-gray-400">
      <div className="inline-flex items-center">
        {t('by')}
        <a
          href="https://rufusmai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 flex items-center text-lg font-semibold text-gray-900 shadow-xs transition-opacity duration-200 ease-in-out hover:opacity-80 dark:text-gray-100"
        >
          <div className="relative mr-1 inline size-6 overflow-hidden rounded-sm border border-gray-400 bg-white dark:bg-gray-800">
            <Image
              src="/avatar.svg"
              width={24}
              height={24}
              alt=""
              className="size-full"
            />
          </div>
          rufusmai
        </a>
      </div>
      <div>
        <a
          href="https://github.com/rufusmai/zeig.li"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs hover:underline"
        >
          {t('github')}
        </a>
      </div>
      <div className="mt-1 space-x-2 text-xs">
        {LOCALES.map((locale) =>
          locale === currentLocale ? (
            <span key={locale} className="font-semibold">
              {LANGUAGE_NAMES[locale]}
            </span>
          ) : (
            <Link
              key={locale}
              href="/"
              locale={locale}
              className="hover:underline"
            >
              {LANGUAGE_NAMES[locale]}
            </Link>
          )
        )}
      </div>
    </footer>
  );
};

export default Footer;

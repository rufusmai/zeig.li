import Image from 'next/image';
import { useTranslations } from 'next-intl';

import LogoIcon from '@/components/layout/logoIcon';

const Header = () => {
  const t = useTranslations('Header');

  return (
    <header className="relative my-8">
      <div
        className="absolute z-0 flex w-full justify-center sm:-top-10 md:-top-20"
        style={{ filter: 'blur(50px)' }}
      >
        <Image
          src="/logo_bg.png"
          width={600}
          height={400}
          alt="Blurry background accent"
          priority
        />
      </div>

      <div className="relative z-20">
        <div className="mx-auto size-20 rounded-xl border border-gray-400 bg-white/50 p-3 text-gray-600 shadow-xs dark:border-gray-500 dark:bg-gray-800/50 dark:text-blue-100">
          <LogoIcon className="drop-shadow-logo" />
        </div>

        <h1 className="mt-2 text-center text-6xl font-bold">
          <span className="bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            zeig.li
          </span>
          <small className="mt-2 block text-2xl font-semibold text-gray-500 dark:text-gray-400">
            {t('tagline')}{' '}
            <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-linear-to-tr from-gray-200 to-gray-100 dark:from-gray-600 dark:to-gray-700">
              ...
            </span>{' '}
            ?!
          </small>
        </h1>
      </div>
    </header>
  );
};

export default Header;

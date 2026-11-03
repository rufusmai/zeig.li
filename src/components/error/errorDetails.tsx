'use client';

import { HomeIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Link, useRouter } from '@/i18n/navigation';
import { SHORT_DOMAIN } from '@/shared/url';

const getMessageKey = (status: number) => {
  switch (status) {
    case 404:
      return 'notFound';
    case 422:
      return 'invalidSlug';
    default:
      return 'unknown';
  }
};

const ErrorDetails = () => {
  const t = useTranslations('Error');
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const status = searchParams.get('status');

  useEffect(() => {
    if (!slug || !status) {
      router.replace('/');
    }
  }, [slug, status, router]);

  if (!slug || !status) {
    return null;
  }

  return (
    <div className="mx-auto mt-32 inline-block text-center">
      <ExclamationCircleIcon className="mx-auto size-20 text-gray-400" />
      <span className="mt-4 block text-xl font-semibold text-gray-400">
        {`https://${SHORT_DOMAIN}/${slug}`}
      </span>
      <h2 className="mx-auto mt-2 max-w-xs text-4xl font-bold text-gray-500 dark:text-gray-300">
        {t(getMessageKey(Number(status)))}
      </h2>
      <Link
        href="/"
        className="mt-8 inline-flex items-center font-semibold text-blue-500 transition duration-200 ease-in-out hover:text-blue-400 focus:outline-hidden dark:text-blue-400 dark:hover:text-blue-300"
      >
        <HomeIcon className="mr-1 size-5" />
        {t('home')}
      </Link>
    </div>
  );
};

export default ErrorDetails;

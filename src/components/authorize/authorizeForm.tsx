'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { ApiError, authorizeRoute } from '@/lib/api';
import { SHORT_DOMAIN } from '@/shared/url';

const AuthorizeForm = () => {
  const t = useTranslations('Authorize');
  const router = useRouter();
  const slug = useSearchParams().get('slug');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.replace('/');
    }
  }, [slug, router]);

  if (!slug) {
    return null;
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordError = () => {
    setPassword('');
    setHasError(true);

    setTimeout(() => setHasError(false), 3000);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    authorizeRoute(slug, password)
      .then((route) => {
        window.location.href = route.url;
      })
      .catch((error: unknown) => {
        if (!(error instanceof ApiError)) {
          return;
        }

        if (error.status === 403) {
          handlePasswordError();
        } else if (error.status === 404) {
          router.push({
            pathname: '/error',
            query: { slug, status: '404' },
          });
        }
      });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-32 text-center">
      <h3 className="text-4xl font-bold">
        {SHORT_DOMAIN}/{slug}
      </h3>
      <span className="text-gray-400">{t('needsPassword')}</span>

      <div className="mt-10">
        <input
          type="password"
          placeholder="••••••••"
          className={`mx-auto block bg-transparent text-center text-4xl font-bold transition-placeholder focus:outline-hidden ${hasError ? 'placeholder-red-400' : 'placeholder-gray-500'}`}
          autoComplete="current-password"
          value={password}
          onChange={handleInput}
          autoFocus
        />
        <div className="mt-4 text-sm font-semibold text-gray-500">
          {t('hint')}
        </div>
      </div>
    </form>
  );
};

export default AuthorizeForm;

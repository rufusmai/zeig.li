import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import AuthorizeForm from '@/components/authorize/authorizeForm';
import SmallHeader from '@/components/layout/smallHeader';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Metadata');

  return { title: t('authorize') };
};

const Authorize = () => {
  return (
    <main className="flex min-h-screen w-full flex-col flex-wrap md:container">
      <SmallHeader />

      {/* The slug is only known in the browser (query string of a static page) */}
      <Suspense>
        <AuthorizeForm />
      </Suspense>
    </main>
  );
};

export default Authorize;

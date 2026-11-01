import type { Metadata } from 'next';
import { Suspense } from 'react';

import ErrorDetails from '@/components/error/errorDetails';
import SmallHeader from '@/components/layout/smallHeader';

export const metadata: Metadata = {
  title: 'Nicht verfügbar | zeig.ml',
};

const ErrorPage = () => {
  return (
    <main className="flex min-h-screen w-full flex-col flex-wrap md:container">
      <SmallHeader />

      {/* Slug and status are only known in the browser (query string of a static page) */}
      <Suspense>
        <ErrorDetails />
      </Suspense>
    </main>
  );
};

export default ErrorPage;

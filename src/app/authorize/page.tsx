import type { Metadata } from 'next';
import { Suspense } from 'react';

import AuthorizeForm from '@/components/authorize/authorizeForm';
import SmallHeader from '@/components/layout/smallHeader';

export const metadata: Metadata = {
  title: 'Zugangsdaten benötigt',
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

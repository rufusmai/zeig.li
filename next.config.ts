import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Exported as static HTML for Firebase Hosting; the redirect and the API run
// in Cloud Functions (see firebase.json).
const nextConfig: NextConfig = {
  output: 'export',
  // A static export has no server to optimize images on.
  images: { unoptimized: true },
};

// Loads the messages via src/i18n/request.ts
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

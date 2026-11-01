import type { NextConfig } from 'next';

// Exported as static HTML for Firebase Hosting; the redirect and the API run
// in Cloud Functions (see firebase.json).
const nextConfig: NextConfig = {
  output: 'export',
  // A static export has no server to optimize images on.
  images: { unoptimized: true },
};

export default nextConfig;

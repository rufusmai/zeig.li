import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'zeig.ml | URL Shortener',
  icons: { icon: '/favicon.ico' },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>

        <Script
          src="https://datenkrake.rufusmai.com/umami.js"
          data-website-id="45dab984-6297-4ce7-97f0-2e203a83260e"
          data-domains="zeig.ml"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
};

export default RootLayout;

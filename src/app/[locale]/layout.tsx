import '../globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// A static export only has the pages of these locales
export const dynamicParams = false;

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Metadata');

  return {
    title: {
      default: t('title'),
      template: '%s | zeig.li',
    },
  };
};

const RootLayout = async ({ children }: LayoutProps<'/[locale]'>) => {
  const locale = await getLocale();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>

        <Script
          src="https://datenkrake.rufusmai.com/umami.js"
          data-website-id="45dab984-6297-4ce7-97f0-2e203a83260e"
          data-domains="zeig.li"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
};

export default RootLayout;

// next typegen skips the root params when a root layout sits at / (here
// app/(redirect)), although Next.js reads them per route at runtime. So the
// root param of app/[locale]/layout.tsx is declared by hand.
declare module 'next/root-params' {
  export function locale(): Promise<string | undefined>;
}

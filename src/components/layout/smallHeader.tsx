import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

const SmallHeader = () => {
  return (
    <header className="relative my-8">
      <div
        className="absolute -top-16 z-0 flex w-full justify-center"
        style={{ filter: 'blur(50px)' }}
      >
        <Image
          src="/logo_bg.png"
          width={400}
          height={200}
          alt="Blurry background accent"
          priority
        />
      </div>

      <Link href="/">
        <div className="relative z-20 flex items-center justify-center">
          <div className="size-16 rounded-xl border border-gray-400 bg-white/50 p-2 text-gray-600 shadow-xs dark:border-gray-500 dark:bg-gray-800/50 dark:text-blue-100">
            <CursorArrowRaysIcon className="drop-shadow-logo" />
          </div>

          <h1 className="-mb-5 ml-3 bg-linear-to-r from-blue-500 to-cyan-600 bg-clip-text pb-5 text-6xl font-bold text-transparent">
            zeig.li
          </h1>
        </div>
        <h3 className="mt-2 text-center text-2xl text-gray-100/75">
          URL Shortener
        </h3>
      </Link>
    </header>
  );
};

export default SmallHeader;

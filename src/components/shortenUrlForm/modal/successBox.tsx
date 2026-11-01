import { CursorArrowRaysIcon } from '@heroicons/react/20/solid';
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { onValue } from 'firebase/database';
import { useEffect, useState } from 'react';

import { getVisitsRef } from '@/lib/firebase';
import type { ShortenUrlResponse } from '@/shared/types';
import { SHORT_DOMAIN } from '@/shared/url';

type Props = {
  shortUrl: ShortenUrlResponse;
  onClose: () => void;
};

const SuccessBox = ({ shortUrl, onClose }: Props) => {
  const [copied, setCopied] = useState<boolean | null>(null);
  const [visits, setVisits] = useState<number | null>(null);

  // onValue returns the unsubscribe function
  useEffect(
    () =>
      onValue(getVisitsRef(shortUrl.slug), (snapshot) => {
        setVisits(snapshot.val() as number | null);
      }),
    [shortUrl.slug]
  );

  const copyUrl = () => {
    navigator.clipboard
      .writeText(shortUrl.url)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
      .finally(() => setTimeout(() => setCopied(null), 3000));
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center text-center sm:text-left">
        <CheckIcon className="hidden size-16 text-green-500 sm:block dark:text-green-400" />
        <div className="w-full sm:ml-3 sm:w-auto">
          <div className="text-sm text-green-600 dark:text-green-400">
            Deine Url ist live!
          </div>
          <div className="group relative inline-block pr-8">
            <a
              className="block text-2xl font-semibold wrap-break-word"
              href={shortUrl.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SHORT_DOMAIN}/{shortUrl.slug}
            </a>
            <button
              type="button"
              className={`absolute top-1/2 right-0 -translate-y-1/2 text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-500 focus:outline-hidden dark:text-gray-300 dark:hover:text-gray-100 ${copied ? 'text-green-500 hover:text-green-500 dark:text-green-400 dark:hover:text-green-400' : copied === false && 'text-red-500 hover:text-red-500 dark:text-red-400 dark:hover:text-red-400'}`}
              title="URL kopieren"
              onClick={copyUrl}
            >
              <ClipboardDocumentIcon className="size-6" />
            </button>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-auto sm:text-right">
          <div>
            <span className="mr-1 inline-flex items-center rounded-sm bg-gray-100 px-1 py-0.5 text-xs text-gray-400 uppercase dark:bg-gray-900">
              <span className="relative mr-1 flex size-2 items-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75 dark:bg-blue-300" />
                <span className="relative inline-flex size-2 rounded-full bg-blue-500 dark:bg-blue-400" />
              </span>
              Live
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Aufrufe
            </span>
          </div>
          <div className="text-2xl font-semibold">{visits ?? '-'}</div>
        </div>
      </div>
      <button
        type="button"
        className="mx-auto mt-4 flex items-center text-sm font-semibold text-blue-500 transition-colors duration-200 ease-in-out hover:text-blue-400 focus:outline-hidden sm:mx-0 sm:mt-2 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={onClose}
      >
        <CursorArrowRaysIcon className="mr-1 inline-block size-4" />
        Neue Url kürzen
      </button>
    </>
  );
};

export default SuccessBox;

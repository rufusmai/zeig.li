import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import {
  BackspaceIcon,
  CheckIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import type { ChangeEvent } from 'react';

/**
 * Why the url can't be shortened: not a web address, not allowed (our rules or
 * Google Web Risk), or the server could not check it right now
 */
export type UrlProblem = 'invalid' | 'blocked' | 'unverified';

const problemMessages: Record<UrlProblem, string> = {
  invalid: 'Ungültige URL',
  blocked: 'Diese URL kann nicht gekürzt werden',
  unverified: 'Die URL konnte nicht geprüft werden, versuch es gleich nochmal',
};

type Props = {
  url: string;
  setUrl: (url: string) => void;
  onClose: () => void;
  urlSet: boolean;
  problem?: UrlProblem;
  loading: boolean;
  done: boolean;
};

const UrlInput = ({
  url,
  setUrl,
  onClose,
  urlSet,
  problem,
  loading,
  done,
}: Props) => {
  // An unverified url may be sent again
  const urlValid = !problem || problem === 'unverified';
  const handleInput = (e: ChangeEvent<HTMLInputElement>) =>
    setUrl(e.target.value.replaceAll(' ', ''));

  return (
    <div className="flex items-start">
      <LinkIcon
        className={`mr-2 size-10 flex-none ${!urlSet ? 'text-gray-400 dark:text-gray-500' : 'hidden sm:block'} transition-colors duration-200 ease-in-out`}
      />
      <div
        className={`transition-max-width duration-300 ease-in-out sm:w-full ${urlSet ? 'max-w-screen sm:max-w-[35rem]' : 'max-w-[15rem]'}`}
      >
        <label className="flex items-center sm:w-full">
          <span className="sr-only">Url kürzen</span>
          <input
            type="text"
            placeholder="URL kürzen..."
            className="-mt-1 mr-2 h-12 w-full min-w-0 border-none bg-transparent text-4xl font-bold placeholder-gray-400 focus:outline-hidden dark:placeholder-gray-500"
            value={url}
            onChange={handleInput}
            disabled={done}
            autoComplete="url"
            autoFocus
          />
          {urlSet && !loading && !done && (
            <button
              type="button"
              onClick={onClose}
              className={`focus:outline-hidden ${urlValid ? 'hidden sm:block' : ''}`}
            >
              <BackspaceIcon className="size-8 self-center text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
            </button>
          )}
        </label>
        {urlSet && !loading && !done && (
          <span className="font-semibold text-gray-400 dark:text-gray-500">
            {problem ? (
              <span className="italic">
                <ExclamationTriangleIcon className="mr-1 inline-block size-5 text-yellow-500" />
                {problemMessages[problem]}
              </span>
            ) : (
              <span className="hidden sm:block">
                Klicke ENTER zum erstellen
              </span>
            )}
          </span>
        )}
      </div>
      {urlSet && urlValid && !loading && !done && (
        <button
          type="submit"
          title="Kurze URL erstellen"
          className="ml-1 text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-900 focus:outline-hidden dark:text-gray-500 dark:hover:text-gray-100"
        >
          <CheckIcon className="size-10" />
        </button>
      )}
    </div>
  );
};

export default UrlInput;

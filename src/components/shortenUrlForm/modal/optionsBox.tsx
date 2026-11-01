import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { CheckIcon, LockClosedIcon } from '@heroicons/react/20/solid';
import { BackspaceIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { type ChangeEvent, Fragment, useEffect } from 'react';

import { checkSlug, type UrlVisibility } from '@/lib/api';
import { MAX_SLUG_LENGTH, validateSlug } from '@/shared/slug';
import { SHORT_DOMAIN } from '@/shared/url';

type Props = {
  slug: string;
  randomSlug: string;
  setSlug: (slug: string) => void;
  password?: string;
  setPassword: (enable?: string) => void;
  visibility: UrlVisibility;
  setVisibility: (visibility: UrlVisibility) => void;
  visibilities: UrlVisibility[];
  slugError: number | undefined;
  setSlugError: (valid: number | undefined) => void;
};

const getErrorMessage = (error: number | undefined): string => {
  switch (error) {
    case 400:
      return 'Diese URL ist bereits vergeben!';
    case 422:
      return `Max. ${MAX_SLUG_LENGTH} Zeichen. Nur Buchstaben, Zahlen und (Unter-)Striche sind erlaubt!`;
    default:
      return 'Diese URL ist ungültig';
  }
};

const OptionsBox = ({
  slug,
  randomSlug,
  setSlug,
  password,
  setPassword,
  visibility,
  setVisibility,
  visibilities,
  slugError,
  setSlugError,
}: Props) => {
  const handleSlugInput = (e: ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;

    if (slug && !validateSlug(slug)) {
      setSlugError(422);
    } else {
      setSlugError(undefined);
    }

    setSlug(slug);
  };
  const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const enablePassword = (enable: boolean) =>
    setPassword(enable ? '' : undefined);

  // Check availability once the user stops typing
  useEffect(() => {
    if (!slug || slugError) {
      return;
    }

    const timeOutId = setTimeout(() => {
      void checkSlug(slug).then((available) => {
        if (!available) {
          setSlugError(400);
        }
      });
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [slug, slugError, setSlugError]);

  return (
    <div className="flex flex-wrap sm:flex-nowrap">
      <div className="mr-3 w-full">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Short-URL:
        </span>
        <div className="relative text-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
            <span className="font-semibold text-gray-400 dark:text-gray-400">
              {SHORT_DOMAIN}/
            </span>
          </div>
          <input
            type="text"
            className="w-full min-w-0 bg-transparent pl-24 leading-tight font-bold placeholder-gray-300 transition-colors duration-200 ease-in-out focus:outline-hidden dark:placeholder-gray-500"
            placeholder={randomSlug}
            value={slug}
            onChange={handleSlugInput}
            autoComplete="off"
          />
        </div>
        <Transition
          as="div"
          show={!!slugError}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="text-xs text-red-500 dark:text-red-400">
            {getErrorMessage(slugError)}
          </div>
        </Transition>

        <div className="mt-2">
          {password !== undefined ? (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Passwort:
              </span>
              <div className="relative">
                <input
                  type="password"
                  className="block w-full min-w-0 bg-transparent text-2xl leading-tight font-bold placeholder-gray-300 focus:outline-hidden dark:placeholder-gray-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordInput}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-300 transition-colors duration-200 ease-in-out hover:text-gray-500 focus:outline-hidden dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => enablePassword(false)}
                >
                  <BackspaceIcon className="size-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-blue-500 focus:outline-hidden dark:text-blue-400"
              onClick={() => enablePassword(true)}
            >
              <LockClosedIcon className="-mt-0.5 mr-1 inline-block size-4" />
              Mit Passwort schützen
            </button>
          )}
        </div>
      </div>
      <div className="relative mt-2 w-full flex-none text-left sm:mt-0 sm:ml-auto sm:w-36 sm:text-right">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Sichtbarkeit:
        </span>
        <Listbox value={visibility} onChange={setVisibility}>
          {({ open }) => (
            <>
              <ListboxButton className="mt-1 ml-auto flex w-full min-w-min items-center justify-between rounded-lg border border-gray-300 py-2 pr-2 pl-3 shadow-xs focus:ring-3 focus:ring-blue-500/50 focus:outline-hidden sm:w-auto dark:border-gray-500 dark:bg-gray-700">
                <span className="flex-none">{visibility.name}</span>
                <ChevronUpDownIcon className="size-5 flex-none text-gray-400" />
              </ListboxButton>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions
                  static
                  className="absolute w-full rounded-lg border border-gray-300 bg-white py-1 text-left shadow-xs focus:outline-hidden dark:border-gray-500 dark:bg-gray-800"
                >
                  {visibilities.map((option) => (
                    <ListboxOption as={Fragment} key={option.id} value={option}>
                      {({ focus, selected }) => (
                        <li
                          className={`relative px-3 py-2 pr-9 ${focus ? 'bg-gray-100 dark:bg-gray-700' : ''} ${selected ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                        >
                          {option.name}

                          {selected && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <CheckIcon className="size-5" />
                            </span>
                          )}
                        </li>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </>
          )}
        </Listbox>
      </div>
    </div>
  );
};

export default OptionsBox;

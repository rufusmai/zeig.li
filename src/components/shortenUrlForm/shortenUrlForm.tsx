'use client';

import { Transition } from '@headlessui/react';
import { type FormEvent, useState } from 'react';

import { ApiError, shortenUrl, type UrlVisibility } from '@/lib/api';
import { getRandomSlug } from '@/shared/slug';
import type { ShortenUrlResponse } from '@/shared/types';
import { validateUrl } from '@/shared/url';

import ErrorBox from './modal/errorBox';
import LoadingSkeleton from './modal/loadingSkeleton';
import Modal from './modal/modal';
import OptionsBox from './modal/optionsBox';
import SuccessBox from './modal/successBox';
import UrlInput from './urlInput';

const visibilities: UrlVisibility[] = [
  { id: 'infinite', name: 'Immer', time: -1 },
  { id: '5min', name: '5 Minuten', time: 5 },
  { id: '15min', name: '15 Minuten', time: 15 },
  { id: '1h', name: 'Eine Stunde', time: 60 },
  { id: '1d', name: 'Ein Tag', time: 60 * 24 },
];

const ShortenUrlForm = () => {
  const [url, setUrl] = useState('');
  const [randomSlug, setRandomSlug] = useState(getRandomSlug);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<number | undefined>(undefined);
  const [visibility, setVisibility] = useState(visibilities[0]);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<ShortenUrlResponse | undefined>(
    undefined
  );
  const [limitReached, setLimitReached] = useState(false);

  const urlSet = url.length > 0;
  const urlValid = validateUrl(url);

  const reset = () => {
    setUrl('');
    setSlug('');
    setSlugError(undefined);
    setVisibility(visibilities[0]);
    setPassword(undefined);
    setLoading(false);
    setShortUrl(undefined);
    setRandomSlug(getRandomSlug());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (slugError || loading || shortUrl) {
      return;
    }

    setLoading(true);

    shortenUrl({
      slug: slug || randomSlug,
      replaceSlugIfExists: !slug,
      visibility,
      url,
      password,
    })
      .then(setShortUrl)
      .catch((error: unknown) => {
        if (!(error instanceof ApiError)) {
          return;
        }

        if ([400, 422].includes(error.status)) {
          setSlugError(error.status);
        } else if (error.status === 429) {
          setLimitReached(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  let option;
  if (limitReached) {
    option = <ErrorBox />;
  } else if (loading) {
    option = <LoadingSkeleton />;
  } else if (shortUrl) {
    option = <SuccessBox shortUrl={shortUrl} onClose={reset} />;
  } else {
    option = (
      <OptionsBox
        slug={slug}
        randomSlug={randomSlug}
        setSlug={setSlug}
        password={password}
        setPassword={setPassword}
        visibility={visibility}
        setVisibility={setVisibility}
        visibilities={visibilities}
        slugError={slugError}
        setSlugError={setSlugError}
      />
    );
  }

  return (
    <div className="flex flex-wrap justify-center">
      <form className="relative z-10 mx-2" onSubmit={handleSubmit}>
        <UrlInput
          url={url}
          setUrl={setUrl}
          onClose={reset}
          urlSet={urlSet}
          urlValid={urlValid}
          loading={loading}
          done={!!shortUrl}
        />

        <Transition
          as="div"
          show={urlSet && urlValid}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Modal valid={!slugError && !limitReached}>{option}</Modal>
        </Transition>
      </form>
    </div>
  );
};

export default ShortenUrlForm;

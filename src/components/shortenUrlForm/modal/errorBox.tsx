import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

const ErrorBox = () => {
  const t = useTranslations('Limit');

  return (
    <div className="flex">
      <LockClosedIcon className="size-16 text-gray-400 dark:text-gray-500" />
      <div className="ml-3">
        <h1 className="max-w-sm text-2xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-sm">
          {t('question')}
          <br />
          {t('offer')}
        </p>
        <a
          href="https://rufusmai.com/contact"
          className="mt-2 flex items-center text-sm font-semibold text-blue-500 transition-colors duration-200 ease-in-out hover:text-blue-400 focus:outline-hidden dark:text-blue-400 dark:hover:text-blue-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ChatBubbleLeftEllipsisIcon className="mr-1 inline-block size-4" />
          {t('contact')}
        </a>
      </div>
    </div>
  );
};

export default ErrorBox;

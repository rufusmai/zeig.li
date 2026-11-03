import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Like the Next.js versions, but paths get the current locale as prefix
 */
export const { Link, useRouter } = createNavigation(routing);

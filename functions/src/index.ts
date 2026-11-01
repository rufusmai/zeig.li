import { initializeApp } from 'firebase-admin/app';

import clearOutdatedUrls from './clearOutdatedUrls';
import urlShortener from './urlShortener/app';

initializeApp();

export { clearOutdatedUrls, urlShortener };

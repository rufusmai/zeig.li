import { initializeApp } from 'firebase-admin/app';

import budgetKillSwitch from './budgetKillSwitch';
import clearOutdatedUrls from './clearOutdatedUrls';
import urlShortener from './urlShortener/app';

initializeApp();

export { budgetKillSwitch, clearOutdatedUrls, urlShortener };

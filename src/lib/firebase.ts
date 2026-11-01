import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type AppCheck,
  getLimitedUseToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import {
  type Auth,
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import {
  connectDatabaseEmulator,
  type Database,
  type DatabaseReference,
  getDatabase,
  ref,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCbzm1e57mh4NF0IA3qGqFsYFP45HhPIbM',
  authDomain: 'zeig-ml.firebaseapp.com',
  databaseURL: 'https://zeig-ml.firebaseio.com',
  projectId: 'zeig-ml',
  storageBucket: 'zeig-ml.appspot.com',
  messagingSenderId: '103562936467',
  appId: '1:103562936467:web:5da1c3b37fd8c9a5ce4d66',
  measurementId: 'G-4507QNJ6LY',
};

/**
 * reCAPTCHA Enterprise key behind App Check, valid for zeig.li and the Firebase hosts
 */
const RECAPTCHA_SITE_KEY = '6LdougsuAAAAAPtLo-BGjmnjqkTXMsINo5MoDW7A';

const isDevelopment = process.env.NODE_ENV === 'development';

let services:
  { auth: Auth; db: Database; appCheck: AppCheck | undefined } | undefined;

/**
 * Initializes Firebase on first use, so nothing runs while the static pages
 * are prerendered at build time. Locally the emulators are used and App Check
 * is left out (the emulator does not check it).
 */
const getServices = () => {
  if (!services) {
    const isFirstInit = getApps().length === 0;
    const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

    services = {
      auth: getAuth(app),
      db: getDatabase(app),
      appCheck: isDevelopment
        ? undefined
        : initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
            // Only single-use tokens are needed, see getAppCheckToken
            isTokenAutoRefreshEnabled: false,
          }),
    };

    if (isFirstInit && isDevelopment) {
      connectDatabaseEmulator(services.db, 'localhost', 9000);
      connectAuthEmulator(services.auth, 'http://localhost:9099', {
        disableWarnings: true,
      });
    }
  }

  return services;
};

/**
 * Starts Firebase and reCAPTCHA early: reCAPTCHA rates the visit better when
 * it has seen more of it than the moment of the click.
 */
export const prepareFirebase = (): void => {
  getServices();
};

/**
 * Returns an ID token of the signed-in user, signing in anonymously if there is none.
 * Waits for the stored session first, so a reload keeps the same user. A stored
 * session that can't be refreshed anymore (e.g. the user was deleted) is replaced.
 */
export const getIdToken = async (): Promise<string> => {
  const { auth } = getServices();
  await auth.authStateReady();

  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      await signOut(auth);
    }
  }

  return (await signInAnonymously(auth)).user.getIdToken();
};

/**
 * A single-use App Check token: the function consumes it, so every new link
 * needs its own reCAPTCHA check. Undefined in development.
 */
export const getAppCheckToken = async (): Promise<string | undefined> => {
  const { appCheck } = getServices();

  return appCheck ? (await getLimitedUseToken(appCheck)).token : undefined;
};

export const getVisitsRef = (slug: string): DatabaseReference =>
  ref(getServices().db, `routes/${slug}/visits`);

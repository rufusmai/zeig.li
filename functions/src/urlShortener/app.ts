import cors from 'cors';
import express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

import { readIdToken, requireIdToken } from '../lib/auth/firebase';
import { verifyPasswordMiddleware } from '../lib/auth/password';
import { validateSlugMiddleware } from '../lib/slug';
import getUrl from './getUrl';
import resolveUrl from './resolveUrl';
import shortenUrl from './shortenUrl';

const app = express();
const corsMiddle = cors({ origin: true });

app.options('/{*splat}', corsMiddle);

app.post('/url', corsMiddle, requireIdToken, shortenUrl);
app.get(
  '/url/:slug',
  corsMiddle,
  validateSlugMiddleware,
  readIdToken,
  verifyPasswordMiddleware,
  getUrl
);

app.get('/:slug', validateSlugMiddleware, resolveUrl);

// Same region as the Realtime Database
export default onRequest({ region: 'us-central1' }, app);

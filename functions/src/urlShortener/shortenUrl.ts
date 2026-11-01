import type { Request, Response } from 'express';
import { logger } from 'firebase-functions';

import { validateSlug } from '../../../src/shared/slug';
import { nowSeconds } from '../../../src/shared/time';
import type {
  ApiErrorCode,
  ApiErrorResponse,
  ShortenUrlResponse,
  UrlRoute,
} from '../../../src/shared/types';
import { checkUrl, normalizeUrl, SHORT_DOMAIN } from '../../../src/shared/url';
import { getUser } from '../lib/auth/firebase';
import { hashPassword } from '../lib/auth/password';
import { getRouteRef, getUrlRoutesOfUser } from '../lib/db';
import { getClientIp, takeDailyQuota } from '../lib/rateLimit';
import { getSlug } from '../lib/slug';
import { getWebRiskThreats } from '../lib/webRisk';

/**
 * Maximum amount of urls a user can shorten per day if they are not premium
 */
const URL_USER_LIMIT = 5;

const DAY = 24 * 60 * 60;

/**
 * All parameters that can be submitted in the request body when initiating a shorten url request
 */
type ShortenUrlRequest = {
  /**
   * Must be a valid url with one exception: http(s) is not required and will be added automatically
   */
  url: string;
  /**
   * Must be a valid slug {@link validateSlug}
   */
  slug?: string;
  /**
   * if true a fresh valid slug will be generated if the given slug is already taken
   */
  replaceSlugIfExists?: boolean;
  /**
   * Unix seconds until when the created shorten url will be resolvable, at most one day ahead
   * if missing, the url is valid infinitely
   */
  validUntil?: number;
  /**
   * password that every visitor will be prompted for before the redirect to the target url
   * if missing, the user is directly redirected
   */
  password?: string;
};

const fail = (
  response: Response,
  status: number,
  code: ApiErrorCode,
  msg: string
): void => {
  const body: ApiErrorResponse = { msg, code };
  response.status(status).json(body);
};

/**
 * Create a new shortened url.
 * Must run after {@link requireIdToken}, so only signed-in (also anonymous) users can create urls.
 * The request body can be like {@link ShortenUrlRequest}
 *
 * @param {Request} request
 * @param {Response} response
 */
const shortenUrl = async (
  request: Request,
  response: Response
): Promise<void> => {
  const body = request.body as Partial<ShortenUrlRequest> | undefined;
  const user = getUser(response);

  if (!user) {
    fail(response, 403, 'unauthorized', 'Missing or invalid ID token!');
    return;
  }

  if (typeof body?.url !== 'string' || !body.url) {
    fail(response, 400, 'missing_parameters', 'Missing parameters');
    return;
  }

  const urlCheck = checkUrl(body.url);
  if (urlCheck === 'invalid') {
    fail(response, 400, 'url_invalid', 'Invalid URL');
    return;
  }
  if (urlCheck === 'blocked') {
    fail(response, 422, 'url_blocked', 'This URL cannot be shortened');
    return;
  }

  // Add https if http(s) protocol is missing in url
  const url = normalizeUrl(body.url);

  if (body.slug && !validateSlug(body.slug)) {
    fail(response, 422, 'slug_invalid', 'Invalid Slug!');
    return;
  }

  // verify validUntil
  const validUntil = body.validUntil ?? null;
  if (
    validUntil !== null &&
    (typeof validUntil !== 'number' ||
      validUntil <= nowSeconds() ||
      validUntil > nowSeconds() + DAY + 60)
  ) {
    fail(
      response,
      400,
      'valid_until_invalid',
      'validUntil must be a Unix timestamp within the next day!'
    );
    return;
  }

  const clientIp = getClientIp(request);

  // abort if user is not premium and has its limit exceeded
  if (user.premium !== true) {
    const minDate = nowSeconds() - DAY;
    const routes = await getUrlRoutesOfUser(user.uid);
    const count = Object.values(routes).filter(
      (route) => route.created > minDate
    ).length;

    if (count >= URL_USER_LIMIT) {
      fail(response, 429, 'limit_reached', 'Max url count exceeded!');
      return;
    }

    // A new anonymous account per link would get around the limit above
    if (!(await takeDailyQuota(clientIp.ip))) {
      logger.warn('Daily limit of an IP address or the site reached', {
        ipSource: clientIp.source,
      });
      fail(response, 429, 'limit_reached', 'Max url count exceeded!');
      return;
    }
  }

  // Known malware and phishing; without an answer from Web Risk nothing is created
  let threats: string[];
  try {
    threats = await getWebRiskThreats(url);
  } catch (error) {
    logger.error('Web Risk lookup failed', error);
    fail(
      response,
      503,
      'url_unverified',
      'The URL could not be checked, please try again later'
    );
    return;
  }
  if (threats.length > 0) {
    logger.warn('Rejected a url listed by Web Risk', {
      url,
      threats,
      uid: user.uid,
    });
    fail(response, 422, 'url_blocked', 'This URL cannot be shortened');
    return;
  }

  let slug: string;
  try {
    slug = await getSlug(body.slug, body.replaceSlugIfExists);
  } catch {
    fail(response, 400, 'slug_taken', 'This slug already exists!');
    return;
  }

  const password =
    typeof body.password === 'string' && body.password
      ? await hashPassword(body.password)
      : null;

  const route: UrlRoute = {
    url,
    uid: user.uid,
    created: nowSeconds(),
    password,
    validUntil,
    visits: 0,
  };
  await getRouteRef(slug).set(route);

  logger.info('Created a short link', {
    slug,
    host: new URL(url).hostname,
    ipSource: clientIp.source,
  });

  const result: ShortenUrlResponse = {
    msg: 'Successfully saved url!',
    url: `https://${SHORT_DOMAIN}/${slug}`,
    slug,
    password: !!password,
    validUntil,
  };

  response.json(result);
};

export default shortenUrl;

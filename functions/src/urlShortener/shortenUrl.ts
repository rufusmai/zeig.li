import type { Request, Response } from 'express';

import { validateSlug } from '../../../src/shared/slug';
import { nowSeconds } from '../../../src/shared/time';
import type { ShortenUrlResponse, UrlRoute } from '../../../src/shared/types';
import { SHORT_DOMAIN, validateUrl } from '../../../src/shared/url';
import { getUser } from '../lib/auth/firebase';
import { hashPassword } from '../lib/auth/password';
import { getRouteRef, getUrlRoutesOfUser } from '../lib/db';
import { getSlug } from '../lib/slug';

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
    response.status(403).json({
      msg: 'Missing or invalid ID token!',
    });
    return;
  }

  if (typeof body?.url !== 'string' || !body.url) {
    response.status(400).json({
      msg: 'Missing parameters',
    });
    return;
  }

  if (!validateUrl(body.url)) {
    response.status(400).json({
      msg: 'Invalid URL',
    });
    return;
  }

  // Add https if http(s) protocol is missing in url
  const url = /^https?:\/\//.test(body.url) ? body.url : `https://${body.url}`;

  if (body.slug && !validateSlug(body.slug)) {
    response.status(422).json({
      msg: 'Invalid Slug!',
    });
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
    response.status(400).json({
      msg: 'validUntil must be a Unix timestamp within the next day!',
    });
    return;
  }

  let slug: string;
  try {
    slug = await getSlug(body.slug, body.replaceSlugIfExists);
  } catch {
    response.status(400).json({
      msg: 'This slug already exists!',
    });
    return;
  }

  // abort if user is not premium and has its limit exceeded
  if (user.premium !== true) {
    const minDate = nowSeconds() - DAY;
    const routes = await getUrlRoutesOfUser(user.uid);
    const count = Object.values(routes).filter(
      (route) => route.created > minDate
    ).length;

    if (count >= URL_USER_LIMIT) {
      response.status(429).json({
        msg: 'Max url count exceeded!',
      });
      return;
    }
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

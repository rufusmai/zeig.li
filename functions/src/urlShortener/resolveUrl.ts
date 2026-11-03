import type { Response } from 'express';
import { ServerValue } from 'firebase-admin/database';

import { getRouteRef, getUrlRoute } from '../lib/db';
import { getLocale } from '../lib/locale';
import type { SlugRequest } from '../lib/slug';
import { isTargetAllowed } from '../lib/target';

/**
 * Redirects to the target url that this shortened url points to.
 * The short url is determined by the slug parameter.
 * If the slug is unknown, expired or its target is not allowed (anymore)
 * this redirects to the error page, if it is password protected to the password page.
 *
 * @param {Request} request
 * @param {Response} response
 */
const resolveUrl = async (
  request: SlugRequest,
  response: Response
): Promise<void> => {
  const { slug } = request.params;
  const route = await getUrlRoute(slug);
  const locale = getLocale(request);
  const notFound = `/${locale}/error?slug=${encodeURIComponent(slug)}&status=404`;

  if (!route) {
    response.redirect(notFound);
    return;
  }

  // The target is checked once the password is entered (see getUrl)
  if (route.password) {
    response.redirect(`/${locale}/authorize?slug=${encodeURIComponent(slug)}`);
    return;
  }

  if (!(await isTargetAllowed(slug, route))) {
    response.redirect(notFound);
    return;
  }

  // Count before responding: 2nd gen gets no CPU after the response is sent
  await getRouteRef(slug).update({
    visits: ServerValue.increment(1),
  });

  response.redirect(route.url);
};

export default resolveUrl;

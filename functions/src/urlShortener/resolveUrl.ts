import type { Response } from 'express';
import { ServerValue } from 'firebase-admin/database';

import { getRouteRef, getUrlRoute } from '../lib/db';
import type { SlugRequest } from '../lib/slug';

/**
 * Redirects to the target url that this shortened url points to.
 * The short url is determined by the slug parameter.
 * If the slug is unknown or expired this redirects to the error page,
 * if it is password protected to the password page.
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

  if (!route) {
    response.redirect(`/error?slug=${encodeURIComponent(slug)}&status=404`);
    return;
  }

  if (route.password) {
    response.redirect(`/authorize?slug=${encodeURIComponent(slug)}`);
    return;
  }

  // Count before responding: 2nd gen gets no CPU after the response is sent
  await getRouteRef(slug).update({
    visits: ServerValue.increment(1),
  });

  response.redirect(route.url);
};

export default resolveUrl;

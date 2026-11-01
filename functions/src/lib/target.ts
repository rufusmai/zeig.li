import { logger } from 'firebase-functions';

import type { UrlRoute } from '../../../src/shared/types';
import { checkUrl, normalizeUrl } from '../../../src/shared/url';
import { getRouteRef } from './db';
import { getWebRiskThreats } from './webRisk';

/**
 * Checks a route's target before anyone is sent there: the url rules may have
 * changed since it was created, and Web Risk may have listed the target since.
 * Routes that fail are deleted. If Web Risk can't be reached, the route is
 * served, since it passed the same lookup when it was created.
 *
 * @param {string} slug
 * @param {UrlRoute} route
 * @return {Promise<boolean>} true if the redirect may happen
 */
export const isTargetAllowed = async (
  slug: string,
  route: UrlRoute
): Promise<boolean> => {
  const url = normalizeUrl(route.url);
  let reason: string | undefined;

  if (checkUrl(url) !== 'ok') {
    reason = 'url rules';
  } else {
    try {
      const threats = await getWebRiskThreats(url);
      if (threats.length > 0) {
        reason = `web risk: ${threats.join(', ')}`;
      }
    } catch (error) {
      logger.error('Web Risk lookup failed, serving the route', {
        slug,
        error,
      });
    }
  }

  if (!reason) {
    return true;
  }

  logger.warn('Deleting a route whose target is not allowed', {
    slug,
    url,
    reason,
  });
  await getRouteRef(slug).remove();

  return false;
};

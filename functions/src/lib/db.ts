import { getDatabase, type Reference } from 'firebase-admin/database';

import { nowSeconds } from '../../../src/shared/time';
import type { UrlRoute } from '../../../src/shared/types';

export const getRouteRef = (slug: string): Reference =>
  getDatabase().ref(`routes/${slug}`);

/**
 * Routes created before 2026 may store validUntil as an ISO date string.
 */
const expiresAt = (route: UrlRoute): number | null => {
  const validUntil = route.validUntil as number | string | null | undefined;

  if (typeof validUntil === 'string') {
    return Math.floor(Date.parse(validUntil) / 1000);
  }

  return validUntil ?? null;
};

export const isExpired = (route: UrlRoute): boolean => {
  const until = expiresAt(route);

  return until !== null && until < nowSeconds();
};

/**
 * Returns the route of a slug, or undefined if there is none or it has expired.
 * Expired routes are deleted on the way.
 *
 * @param {string} slug
 * @return {Promise<UrlRoute | undefined>} the route, if it can still be resolved
 */
export const getUrlRoute = async (
  slug: string
): Promise<UrlRoute | undefined> => {
  const ref = getRouteRef(slug);
  const snapshot = await ref.get();

  if (!snapshot.exists()) {
    return undefined;
  }

  const route = snapshot.val() as UrlRoute;

  if (isExpired(route)) {
    await ref.remove();
    return undefined;
  }

  return route;
};

/**
 * Returns all {@link UrlRoute}s a uid has created
 *
 * @param {string} uid firebase auth uid
 * @return {Promise<Record<string, UrlRoute>>} all routes the user has created, by slug
 */
export const getUrlRoutesOfUser = async (
  uid: string
): Promise<Record<string, UrlRoute>> => {
  const snapshot = await getDatabase()
    .ref('routes')
    .orderByChild('uid')
    .equalTo(uid)
    .get();

  return (snapshot.val() as Record<string, UrlRoute> | null) ?? {};
};

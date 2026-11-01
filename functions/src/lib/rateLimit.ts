import { createHash } from 'node:crypto';
import { isIPv6 } from 'node:net';

import type { Request } from 'express';
import { getDatabase } from 'firebase-admin/database';

/**
 * Links one IP address (an IPv6 /64 network) may create per day
 */
const IP_DAILY_LIMIT = 10;

/**
 * Links all non-premium users together may create per day. This bounds the
 * damage even if someone gets around the other limits.
 */
const GLOBAL_DAILY_LIMIT = 200;

/**
 * UTC date, e.g. 2026-11-01. Limits are kept under limits/<day>.
 */
export const today = (): string => new Date().toISOString().slice(0, 10);

export type ClientIp = {
  ip: string;
  /**
   * Where the address came from, logged to see how requests arrive
   */
  source: 'fastly' | 'x-forwarded-for' | 'socket';
};

/**
 * The visitor's IP address. Behind Firebase Hosting, its CDN puts the address
 * the connection came from into Fastly-Client-IP; the left of X-Forwarded-For
 * is whatever the client sent. Direct calls to the function's run.app address
 * can fake both, which is why App Check and the global limit exist as well.
 *
 * @param {Request} req
 * @return {ClientIp} the address and where it was found
 */
export const getClientIp = (req: Request): ClientIp => {
  const fastly = req.get('fastly-client-ip');
  if (fastly) {
    return { ip: fastly.trim(), source: 'fastly' };
  }

  // Google's front end appends the address it saw at the end
  const forwarded = req.get('x-forwarded-for')?.split(',').pop()?.trim();
  if (forwarded) {
    return { ip: forwarded, source: 'x-forwarded-for' };
  }

  return { ip: req.ip ?? 'unknown', source: 'socket' };
};

/**
 * IPv6 users usually get a whole /64 network, so its addresses count together
 *
 * @param {string} ip
 * @return {string} the IPv4 address or the IPv6 /64 network
 */
const toNetwork = (ip: string): string => {
  const mappedIpv4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mappedIpv4) {
    return mappedIpv4[1];
  }
  if (!isIPv6(ip)) {
    return ip;
  }

  const [head, tail = ''] = ip.toLowerCase().split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const groups = [
    ...headGroups,
    ...Array<string>(8 - headGroups.length - tailGroups.length).fill('0'),
    ...tailGroups,
  ];

  return `${groups.slice(0, 4).join(':')}::/64`;
};

/**
 * Only a hash is stored, with the day mixed in, so addresses can't be listed
 *
 * @param {string} ip
 * @return {string} key of the address for today's counter
 */
const ipKey = (ip: string): string =>
  createHash('sha256')
    .update(`${today()}:${toNetwork(ip)}`)
    .digest('hex')
    .slice(0, 32);

const increment =
  (limit: number) =>
  (count: number | null): number | undefined =>
    (count ?? 0) >= limit ? undefined : (count ?? 0) + 1;

/**
 * Counts one new link against today's limit of the visitor's IP address and
 * of the whole site.
 *
 * @param {string} ip see {@link getClientIp}
 * @return {Promise<boolean>} false (and nothing counted) once a limit is reached
 */
export const takeDailyQuota = async (ip: string): Promise<boolean> => {
  const day = getDatabase().ref(`limits/${today()}`);
  const ipCount = day.child(`ips/${ipKey(ip)}`);

  const forIp = await ipCount.transaction(increment(IP_DAILY_LIMIT));
  if (!forIp.committed) {
    return false;
  }

  const total = await day
    .child('total')
    .transaction(increment(GLOBAL_DAILY_LIMIT));
  if (!total.committed) {
    // Give the address its link back, the site is full for today
    await ipCount.transaction((count: number | null) =>
      Math.max((count ?? 1) - 1, 0)
    );
    return false;
  }

  return true;
};

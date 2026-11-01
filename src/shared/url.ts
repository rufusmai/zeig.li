/**
 * Domain the short links live on
 */
export const SHORT_DOMAIN = 'zeig.li';

export const MAX_URL_LENGTH = 2048;

/**
 * Our own hosts: a short link to them would only loop
 */
const OWN_HOSTS = [
  SHORT_DOMAIN,
  'zeig.ml',
  'zeig-ml.web.app',
  'zeig-ml.firebaseapp.com',
];

/**
 * Other URL shorteners: a chain hides the real target from our checks
 */
const SHORTENER_HOSTS = [
  'bit.ly',
  'bitly.com',
  'bityl.co',
  'buff.ly',
  'clck.ru',
  'cutt.ly',
  'cya.nz',
  'dgxy.link',
  'goo.gl',
  'hitty.link',
  'iil.la',
  'iiil.io',
  'is.gd',
  'link-shortener.net',
  'lnkd.in',
  'neon.ly',
  'ow.ly',
  'rb.gy',
  'rebrand.ly',
  'reurl.cc',
  's.id',
  'shawt.af',
  'short.gy',
  'shorturl.asia',
  'shorturl.at',
  'smarturl.it',
  't.co',
  't.ly',
  'tiny.cc',
  'tinyurl.com',
  'tite.one',
  'trunc.us',
  'u.to',
  'v.gd',
  'x.gd',
  'zom.ink',
  // link-in-bio pages hide the target the same way
  'beacons.ai',
  'fanlink.to',
  'flauntly.com',
  'linktr.ee',
  // tracking and redirect services
  'crm.wix.com',
  'getresponse.com',
  'guru-tracking.com',
  'imageproxy.ifunny.co',
  'onelink.me',
  'sendgrid.net',
  'shitty.link',
];

/**
 * Hosts that hand out free subdomains or pages. Almost all phishing that was
 * shortened with zeig.ml pointed to one of these.
 */
const ABUSED_HOSTS = [
  // dynamic DNS
  'cloudns.ph',
  'ddnsgeek.com',
  'dnset.com',
  'duckdns.org',
  'dyndns.org',
  'misecure.com',
  'myvnc.com',
  'onedumb.com',
  'run.place',
  'vantechdns.com',
  // site builders and free hosting
  '000webhostapp.com',
  'cloudwaysapps.com',
  'dynadot.com',
  'elb.amazonaws.com',
  'ewp.live',
  'firebaseapp.com',
  'github.io',
  'gitlab.io',
  'glitch.me',
  'godaddysites.com',
  'herokuapp.com',
  'landingbit.com',
  'netlify.app',
  'pages.dev',
  'plesk.page',
  'renderforestsites.com',
  'replit.app',
  'sites.google.com',
  'squarespace.com',
  'surge.sh',
  'temporary.link',
  'tmweb.ru',
  'tw1.ru',
  'typedream.app',
  'unicornplatform.page',
  'vercel.app',
  'web.app',
  'webflow.io',
  'webnode.tw',
  'webwave.dev',
  'weebly.com',
  'wixsite.com',
  'workers.dev',
  'wpengine.com',
  'xsph.ru',
  'yolasite.com',
  'zappter.com',
  // free forums, file hosters, paste and anonymous publishing
  'forumps.com',
  'justpaste.it',
  'katfile.com',
  'mybb.ru',
  'rentry.co',
  'telegra.ph',
  'vpaste.net',
  'xobor.de',
];

/**
 * Top-level domains that were given away for free (cf … tk) or are cheap and
 * mostly used for spam and phishing
 */
const BLOCKED_TLDS = [
  'bar',
  'best',
  'buzz',
  'cf',
  'cfd',
  'click',
  'cyou',
  'fun',
  'ga',
  'gq',
  'icu',
  'life',
  'live',
  'ml',
  'monster',
  'online',
  'quest',
  'rest',
  'sbs',
  'shop',
  'site',
  'space',
  'store',
  'support',
  'tk',
  'top',
  'website',
  'work',
  'xyz',
];

/**
 * Lowercase domain name with at least one dot and a real top-level domain
 */
const hostnameRegex =
  /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

const matchesHost = (hostname: string, hosts: string[]): boolean =>
  hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));

/**
 * Adds https:// if the url has no protocol
 */
export const normalizeUrl = (url: string): string =>
  /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;

/**
 * - `invalid`: not a web address
 * - `blocked`: a web address we don't shorten (see the lists above)
 */
export type UrlCheck = 'ok' | 'invalid' | 'blocked';

/**
 * Checks a url before it is shortened (in the browser and in the function)
 * and before a short link redirects to it.
 */
export const checkUrl = (url: string): UrlCheck => {
  if (url.length > MAX_URL_LENGTH) {
    return 'invalid';
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizeUrl(url));
  } catch {
    return 'invalid';
  }

  const hostname = parsed.hostname.replace(/\.$/, '');

  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    !hostnameRegex.test(hostname)
  ) {
    return 'invalid';
  }

  // user:password@ is a classic way to make phishing look like a known site
  if (parsed.username || parsed.password || parsed.port) {
    return 'blocked';
  }

  const tld = hostname.slice(hostname.lastIndexOf('.') + 1);

  if (
    BLOCKED_TLDS.includes(tld) ||
    matchesHost(hostname, OWN_HOSTS) ||
    matchesHost(hostname, SHORTENER_HOSTS) ||
    matchesHost(hostname, ABUSED_HOSTS)
  ) {
    return 'blocked';
  }

  return 'ok';
};

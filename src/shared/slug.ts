const BASE64_URL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * checks if input is valid base64url
 */
const SLUG_REGEX = /^[A-Za-z0-9\-_]*$/;

/**
 * All reserved words, that can not be used as slug
 * These may be used as internal urls
 */
const FORBIDDEN_SLUGS = [
  'url',
  'dashboard',
  'authorize',
  'error',
  'api',
  'docs',
  'app',
];

/**
 * The maximum of chars a slug can contain
 */
export const MAX_SLUG_LENGTH = 16;

/**
 * Generates a valid random (not unique) slug
 *
 * @param length=6 this should be left to the default of 6
 */
export const getRandomSlug = (length = 6): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE64_URL.charAt(Math.floor(Math.random() * BASE64_URL.length));
  }

  return result;
};

/**
 * Validated the slug
 * Checks if it only contains valid chars and rejects reserved words that are used for internal urls
 *
 * @param slug
 */
export const validateSlug = (slug: string): boolean => {
  return (
    SLUG_REGEX.test(slug) &&
    !FORBIDDEN_SLUGS.includes(slug) &&
    slug.length <= MAX_SLUG_LENGTH
  );
};

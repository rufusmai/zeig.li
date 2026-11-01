/**
 * A shortened URL as stored under `routes/<slug>` in the Realtime Database.
 * The Realtime Database drops null fields, so optional fields may be missing.
 */
export type UrlRoute = {
  /**
   * Firebase Auth uid of the creator
   */
  uid: string;
  /**
   * Target URL
   */
  url: string;
  /**
   * Unix seconds when the route was created
   */
  created: number;
  /**
   * bcrypt hash; visitors must enter the password before they are redirected
   */
  password?: string | null;
  /**
   * Unix seconds after which the route no longer resolves and gets deleted
   */
  validUntil?: number | null;
  visits?: number;
};

/**
 * Response of `POST /url`
 */
export type ShortenUrlResponse = {
  msg: string;
  /**
   * The short URL, e.g. https://zeig.li/abc123
   */
  url: string;
  slug: string;
  password: boolean;
  validUntil: number | null;
};

/**
 * Response of `GET /url/:slug`
 */
export type UrlInfo = {
  slug: string;
  /**
   * Target URL
   */
  url: string;
  password: boolean;
};

import type { NextFunction, Request, Response } from 'express';

import { getRandomSlug, validateSlug } from '../../../src/shared/slug';
import { getUrlRoute } from './db';
import { getLocale } from './locale';

/**
 * A request for a route with a `:slug` parameter
 */
export type SlugRequest = Request<{ slug: string }>;

/**
 * Middleware that validates the slug
 * This uses the {@link validateSlug} function to determine if slug is valid base64url
 * and does not contain reserved words.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const validateSlugMiddleware = (
  req: SlugRequest,
  res: Response,
  next: NextFunction
): void => {
  const { slug } = req.params;

  if (!validateSlug(slug)) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      res.status(400).json({
        msg: 'Invalid slug!',
      });
    } else {
      res.redirect(
        `/${getLocale(req)}/error?slug=${encodeURIComponent(slug)}&status=422`
      );
    }
    return;
  }

  next();
};

/**
 * Checks if the given slug is still available
 *
 * @param {string} slug
 * @return {Promise<boolean>} true if slug is not taken
 */
const isSlugAvailable = async (slug: string): Promise<boolean> =>
  (await getUrlRoute(slug)) === undefined;

/**
 * Takes a slug and checks if it's available.
 * Use replaceIfExists to automatically return a fresh generated unique slug.
 * Returns the valid slug. Rejects otherwise.
 *
 * @param {string} custom slug that should be checked
 * @param {boolean} replaceIfExists if true this function returns a valid slug (may be a new one)
 * @return {Promise<string>} a valid slug
 */
export const getSlug = async (
  custom?: string,
  replaceIfExists?: boolean
): Promise<string> => {
  if (custom) {
    if (await isSlugAvailable(custom)) {
      return custom;
    }

    if (!replaceIfExists) {
      throw new Error('Slug not available');
    }
  }

  let slug: string;
  do {
    slug = getRandomSlug();
  } while (!(await isSlugAvailable(slug)));

  return slug;
};

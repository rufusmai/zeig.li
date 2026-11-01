import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';

import { getUrlRoute } from '../db';
import type { SlugRequest } from '../slug';
import { getUser } from './firebase';

/**
 * Checks if the given password matches the password hash
 *
 * @param {string} password
 * @param {string} hashedPassword
 * @return {Promise<boolean>} true if passwords are equal
 */
export const checkPassword = (
  password: string,
  hashedPassword: string
): Promise<boolean> => bcrypt.compare(password, hashedPassword);

/**
 * Hashes the given value and returns it
 *
 * @param {string} password
 * @return {Promise<string>} hashed password
 */
export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, 10);

/**
 * Checks the password sent with Basic authentication (user:password).
 * The user part is ignored.
 *
 * @param {Request} req
 * @param {string} hashedPassword the route's password hash
 * @return {Promise<boolean>} true if the password matches
 */
const checkBasicAuth = async (
  req: Request,
  hashedPassword: string
): Promise<boolean> => {
  const [type, data] = req.headers.authorization?.split(' ') ?? [];

  if (type !== 'Basic' || !data) {
    return false;
  }

  const credentials = Buffer.from(data, 'base64').toString('utf8');
  const password = credentials.slice(credentials.indexOf(':') + 1);

  return checkPassword(password, hashedPassword);
};

/**
 * Middleware that only lets a request for a password protected route through
 * if it carries the route's password (Basic authentication) or comes from
 * the route's creator (see {@link readIdToken}).
 * The slug is taken from an url param called "slug"
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const verifyPasswordMiddleware = async (
  req: SlugRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const route = await getUrlRoute(req.params.slug);

  if (!route) {
    res.status(404).json({
      msg: 'Url with that slug does not exist!',
    });
    return;
  }

  const isOwner = getUser(res)?.uid === route.uid;

  if (
    route.password &&
    !isOwner &&
    !(await checkBasicAuth(req, route.password))
  ) {
    res.status(403).json({
      msg: 'Missing or invalid Authorization!',
    });
    return;
  }

  next();
};

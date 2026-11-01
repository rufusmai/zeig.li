import type { NextFunction, Request, Response } from 'express';
import { type DecodedIdToken, getAuth } from 'firebase-admin/auth';

/**
 * Verifies a Firebase Auth ID token sent as `Authorization: Bearer <token>`
 *
 * @param {Request} req
 * @return {Promise<DecodedIdToken | undefined>} the user, if the token is valid
 */
const verifyBearerToken = async (
  req: Request
): Promise<DecodedIdToken | undefined> => {
  const [type, token] = req.headers.authorization?.split(' ') ?? [];

  if (type !== 'Bearer' || !token) {
    return undefined;
  }

  try {
    return await getAuth().verifyIdToken(token);
  } catch {
    return undefined;
  }
};

/**
 * Middleware that stores the user of a valid ID token in `res.locals.user`.
 * Requests without one continue as anonymous visitors.
 *
 * The user is kept per response, not per module: a 2nd gen function handles
 * many requests at once in the same instance.
 */
export const readIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.locals.user = await verifyBearerToken(req);
  next();
};

/**
 * Like {@link readIdToken}, but answers 403 without a valid ID token
 */
export const requireIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await verifyBearerToken(req);

  if (!user) {
    res.status(403).json({
      msg: 'Missing or invalid ID token!',
    });
    return;
  }

  res.locals.user = user;
  next();
};

/**
 * Gets the user that {@link readIdToken} or {@link requireIdToken} stored for this request
 *
 * @param {Response} res
 * @return {DecodedIdToken | undefined} decoded id token
 */
export const getUser = (res: Response): DecodedIdToken | undefined =>
  res.locals.user as DecodedIdToken | undefined;

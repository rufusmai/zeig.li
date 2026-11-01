import type { NextFunction, Request, Response } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';
import { logger } from 'firebase-functions';

import type { ApiErrorResponse } from '../../../../src/shared/types';

/**
 * Middleware that only lets requests through that carry a valid App Check token,
 * which the browser gets from reCAPTCHA Enterprise. Tokens are consumed here, so
 * every new link needs its own reCAPTCHA check and a script can't reuse one.
 * The emulator has no App Check, so the check is skipped there.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const requireAppCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    next();
    return;
  }

  const token = req.get('X-Firebase-AppCheck');

  if (token) {
    try {
      const result = await getAppCheck().verifyToken(token, { consume: true });

      if (!result.alreadyConsumed) {
        next();
        return;
      }
    } catch (error) {
      logger.warn('Rejected an App Check token', error);
    }
  }

  const body: ApiErrorResponse = {
    msg: 'Missing or invalid App Check token',
    code: 'app_check_failed',
  };
  res.status(401).json(body);
};

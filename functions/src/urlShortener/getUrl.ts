import type { Response } from 'express';
import { ServerValue } from 'firebase-admin/database';

import type { UrlInfo } from '../../../src/shared/types';
import { getRouteRef, getUrlRoute } from '../lib/db';
import type { SlugRequest } from '../lib/slug';

/**
 * Returns public data for a specific shortened url that will be determined by the slug parameter
 * Should be used with a middleware that authorizes password protected urls
 *
 * @param {Request} req
 * @param {Response} res
 */
const getUrl = async (req: SlugRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const route = await getUrlRoute(slug);

  if (!route) {
    res.status(404).json({
      msg: 'Url with that slug does not exist!',
    });
    return;
  }

  if (req.query.visit) {
    await getRouteRef(slug).update({
      visits: ServerValue.increment(1),
    });
  }

  const info: UrlInfo = {
    slug,
    url: route.url,
    password: !!route.password,
  };

  res.json(info);
};

export default getUrl;

import { getDatabase } from 'firebase-admin/database';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { nowSeconds } from '../../src/shared/time';
import { today } from './lib/rateLimit';

/**
 * Deletes every route whose validUntil has passed, and the daily limit counters
 * of past days.
 * Routes without validUntil never expire (null sorts first, so the query starts at 1).
 */
export default onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'Europe/Berlin',
    region: 'us-central1',
  },
  async () => {
    const routes = getDatabase().ref('routes');
    const snapshot = await routes
      .orderByChild('validUntil')
      .startAt(1)
      .endAt(nowSeconds())
      .get();

    const updates: Record<string, null> = {};
    snapshot.forEach((child) => {
      if (child.key) {
        updates[child.key] = null;
      }
    });

    logger.info(`Removing ${Object.keys(updates).length} outdated routes...`);
    await routes.update(updates);

    const limits = getDatabase().ref('limits');
    const pastDays = await limits.orderByKey().endBefore(today()).get();
    const limitUpdates: Record<string, null> = {};
    pastDays.forEach((day) => {
      if (day.key) {
        limitUpdates[day.key] = null;
      }
    });
    await limits.update(limitUpdates);
  }
);

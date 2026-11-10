import { logger } from 'firebase-functions';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

const UNLINK_PERMISSION = 'resourcemanager.projects.deleteBillingAssignment';

/** The fields of a Cloud Billing budget notification this function reads. */
type BudgetNotification = {
  budgetDisplayName: string;
  costAmount: number;
  budgetAmount: number;
  currencyCode: string;
};

/**
 * Hard spending cap. The budget "zeig-ml: max 1 EUR/Monat" publishes the month's
 * costs to the budget-alerts topic several times a day; once they reach the
 * budget, this unlinks the project from its billing account. Every paid service
 * stops (the url shortener included) until billing is linked again by hand.
 * Costs arrive with a delay of hours, so they can still end up a bit above the budget.
 *
 * It runs as budget-kill-switch@, which only holds Project Billing Manager on the
 * project and Cloud Run Invoker on this function's service (Eventarc calls it as
 * that account; if the function is deleted and recreated, grant the invoker again).
 * Below the budget it checks that it still may unlink billing, so a lost
 * permission shows up as an error in the logs instead of when it matters.
 */
export default onMessagePublished(
  {
    topic: 'budget-alerts',
    region: 'us-central1',
    serviceAccount: 'budget-kill-switch@',
  },
  async (event) => {
    const { budgetDisplayName, costAmount, budgetAmount, currencyCode } = event
      .data.message.json as BudgetNotification;
    const projectId = await auth.getProjectId();
    const client = await auth.getClient();
    const costs = `${costAmount} of ${budgetAmount} ${currencyCode}`;

    if (costAmount < budgetAmount) {
      const { data } = await client.request<{ permissions?: string[] }>({
        url: `https://cloudresourcemanager.googleapis.com/v3/projects/${projectId}:testIamPermissions`,
        method: 'POST',
        data: { permissions: [UNLINK_PERMISSION] },
      });
      if (data.permissions?.includes(UNLINK_PERMISSION)) {
        logger.info(`${budgetDisplayName}: ${costs}, below the cap`);
      } else {
        logger.error(
          `${budgetDisplayName}: ${costs}, but the kill switch lacks ${UNLINK_PERMISSION} and could not disable billing`
        );
      }
      return;
    }

    logger.warn(
      `${budgetDisplayName}: ${costs}, disabling billing for ${projectId}`
    );
    await client.request({
      url: `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
      method: 'PUT',
      data: { billingAccountName: '' },
    });
    logger.warn(`Billing disabled for ${projectId}`);
  }
);

import { logger } from 'firebase-functions';
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

const THREAT_TYPES = ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'];

/**
 * Urls Web Risk did not list are not looked up again for a few minutes.
 * Google's terms allow acting on lookups for up to 30 minutes.
 */
const SAFE_CACHE_MS = 5 * 60 * 1000;
const safeUntil = new Map<string, number>();

type SearchUrisResponse = {
  threat?: {
    threatTypes: string[];
  };
};

/**
 * Looks the url up in Google Web Risk (the commercial Safe Browsing).
 * Throws if the lookup fails, so callers decide whether to fail open or closed.
 * In the emulator, without Google credentials, it logs and reports the url as safe.
 *
 * @param {string} url full url including the protocol
 * @return {Promise<string[]>} the threat types Web Risk lists the url for, empty if none
 */
export const getWebRiskThreats = async (url: string): Promise<string[]> => {
  if ((safeUntil.get(url) ?? 0) > Date.now()) {
    return [];
  }

  const query = new URLSearchParams({ uri: url });
  THREAT_TYPES.forEach((type) => query.append('threatTypes', type));

  let response: SearchUrisResponse;
  try {
    const client = await auth.getClient();
    const { data } = await client.request<SearchUrisResponse>({
      url: `https://webrisk.googleapis.com/v1/uris:search?${query.toString()}`,
    });
    response = data;
  } catch (error) {
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      logger.warn('Web Risk lookup skipped in the emulator', error);
      return [];
    }
    throw error;
  }

  const threats = response.threat?.threatTypes ?? [];

  if (threats.length === 0) {
    if (safeUntil.size > 10_000) {
      safeUntil.clear();
    }
    safeUntil.set(url, Date.now() + SAFE_CACHE_MS);
  }

  return threats;
};

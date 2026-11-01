import { nowSeconds } from '@/shared/time';
import type {
  ApiErrorCode,
  ApiErrorResponse,
  ShortenUrlResponse,
  UrlInfo,
} from '@/shared/types';

import { getAppCheckToken, getIdToken } from './firebase';

/**
 * In development the Hosting emulator forwards the API to the Functions emulator.
 * It runs on 5050 because macOS keeps 5000 for AirPlay.
 */
const API_BASE =
  process.env.NODE_ENV === 'development' ? 'http://localhost:5050' : '';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: ApiErrorCode
  ) {
    super(`Request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, init);

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      ApiErrorResponse | undefined;
    throw new ApiError(response.status, body?.code);
  }

  return (await response.json()) as T;
};

export type UrlVisibility = {
  id: string;
  name: string;
  /**
   * Minutes until the link expires, -1 for never
   */
  time: number;
};

export type ShortenUrlConfig = {
  slug: string;
  replaceSlugIfExists: boolean;
  visibility?: UrlVisibility;
  url: string;
  password?: string;
};

export const shortenUrl = async ({
  slug,
  replaceSlugIfExists,
  visibility,
  url,
  password,
}: ShortenUrlConfig): Promise<ShortenUrlResponse> => {
  const validUntil =
    visibility && visibility.time > 0
      ? nowSeconds() + visibility.time * 60
      : undefined;

  const [token, appCheckToken] = await Promise.all([
    getIdToken(),
    getAppCheckToken(),
  ]);

  return request<ShortenUrlResponse>('/url', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(appCheckToken && { 'X-Firebase-AppCheck': appCheckToken }),
    },
    body: JSON.stringify({
      slug,
      replaceSlugIfExists,
      url,
      password,
      validUntil,
    }),
  });
};

/**
 * Resolves to true if nobody uses the slug yet
 */
export const checkSlug = async (slug: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/url/${encodeURIComponent(slug)}`);

  return response.status === 404;
};

const toBase64 = (value: string): string =>
  btoa(String.fromCharCode(...new TextEncoder().encode(value)));

export const authorizeRoute = (
  slug: string,
  password: string
): Promise<UrlInfo> =>
  request<UrlInfo>(`/url/${encodeURIComponent(slug)}?visit=true`, {
    headers: {
      authorization: `Basic ${toBase64(`:${password}`)}`,
    },
  });

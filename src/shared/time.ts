/**
 * Current time in Unix seconds, the unit `created` and `validUntil` are stored in
 */
export const nowSeconds = (): number => Math.floor(Date.now() / 1000);

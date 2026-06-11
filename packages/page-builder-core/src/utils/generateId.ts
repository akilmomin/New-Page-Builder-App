/**
 * Generates a cryptographically random 8-character alphanumeric ID.
 * Uses crypto.getRandomValues for better entropy than Math.random.
 * 62^8 ≈ 218 trillion combinations — collision risk is negligible for any realistic layout size.
 */
export const generateId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

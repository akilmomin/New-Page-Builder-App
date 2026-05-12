/**
 * Generates a short 6-character alphanumeric ID.
 * Pure function — no side-effects.
 */
export const generateId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

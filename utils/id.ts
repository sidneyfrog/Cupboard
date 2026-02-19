/**
 * Generates a unique ID string.
 * Uses crypto.randomUUID when available, falling back to a timestamp-based ID.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/** Formats an ISO date string into a human-readable date (e.g. "19 Feb 2026"). */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Returns true if the given ISO date string is in the past. */
export function isExpired(isoString: string): boolean {
  return new Date(isoString) < new Date();
}

/** Returns the number of days until the given ISO date string. Negative if past. */
export function daysUntil(isoString: string): number {
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Returns the current date-time as an ISO string. */
export function nowISO(): string {
  return new Date().toISOString();
}

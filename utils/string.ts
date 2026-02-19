/** Capitalises the first letter of a string. */
export function capitalise(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Replaces the %d placeholder in a string with a number. */
export function interpolate(template: string, value: number): string {
  return template.replace('%d', String(value));
}

/** Case-insensitive substring match. */
export function containsIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Normalises a string for comparison: lowercase and trimmed. */
export function normalise(str: string): string {
  return str.toLowerCase().trim();
}

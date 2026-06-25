function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isCorsOriginAllowed(origin: string, allowed: string[]): boolean {
  if (allowed.includes(origin)) return true;
  return allowed.some((pattern) => pattern.includes('*') && patternToRegExp(pattern).test(origin));
}

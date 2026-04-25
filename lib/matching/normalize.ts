export function normalizeString(input: string | undefined | null): string {
  if (!input) return '';
  return input.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeArrayStrings(values: any): string[] {
  if (!values) return [];
  if (Array.isArray(values)) {
    const set = new Set<string>();
    for (const v of values) {
      const n = normalizeString(v);
      if (n) set.add(n);
    }
    return Array.from(set);
  }
  // If CSV string
  if (typeof values === 'string') {
    return normalizeArrayStrings(values.split(','));
  }
  return [];
}

export function toNumeric(input: string | number | undefined | null): number | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'number') return isFinite(input) ? input : undefined;
  const cleaned = input.toString().replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return isFinite(num) ? num : undefined;
}















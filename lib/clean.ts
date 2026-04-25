export function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanArray(arr: string[] | null | undefined): string[] {
  if (!arr) return [];
  return arr.map(cleanText).filter(Boolean);
}
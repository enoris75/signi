import { syllables } from './syllables.js';

/**
 * Whether an adjective inflects (-er/-est) rather than taking "more"/"most". One-syllable
 * adjectives do ("big" → "bigger"), as do two-syllable ones ending in -y, -le, -ow or -er
 * ("happy" → "happier", "simple" → "simpler"). Participial adjectives are periphrastic
 * whatever their length — "more tired", never "tireder".
 */
export function inflects(base: string): boolean {
  if (/ed$/.test(base)) return false;
  const n = syllables(base);
  if (n === 1) return true;
  return n === 2 && /(y|le|ow|er)$/.test(base);
}

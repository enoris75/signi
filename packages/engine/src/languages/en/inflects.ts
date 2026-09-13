import { syllables } from './syllables.js';

/**
 * Whether an adjective inflects (-er/-est) rather than taking "more"/"most". One-syllable
 * adjectives do ("big" → "bigger"), as do two-syllable ones ending in -y, a syllabic -le after a
 * consonant, or -ow ("happy" → "happier", "simple" → "simpler", "narrow" → "narrower"). The -le of
 * "fe-male" is not syllabic, so FEMALE compares with "more". Among two-syllable adjectives in -er only
 * a few inflect ("clever" → "cleverer"; most, like "neuter", take "more"), so that is a property of the
 * word, passed as `lexical`. Participial adjectives are periphrastic whatever their length — "more
 * tired", never "tireder".
 */
export function inflects(base: string, lexical = false): boolean {
  if (/ed$/.test(base)) return false;
  const n = syllables(base);
  if (n === 1) return true;
  return n === 2 && (lexical || /(y|[^aeiou]le|ow)$/.test(base));
}

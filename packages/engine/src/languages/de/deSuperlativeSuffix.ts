/**
 * The superlative suffix, with the epenthetic -e- German inserts to keep the "-st" pronounceable
 * after a stem ending in a dental/sibilant — -d, -t, -s, -ß, -z, -sch (interessant → interessantest,
 * kalt → kältest, heiß → heißest). Elsewhere the bare "-st" (jung → jüngst, schnell → schnellst).
 */
export function deSuperlativeSuffix(stem: string): string {
  return /(sch|[dtsßz])$/.test(stem) ? 'est' : 'st';
}

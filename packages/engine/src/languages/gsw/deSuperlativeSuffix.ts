/**
 * The superlative suffix, with the epenthetic -e- German inserts to keep the "-st" pronounceable
 * after a stem ending in a dental/sibilant — -d, -t, -s, -ß, -z, -sch (interessant → interessantest,
 * kalt → kältest, heiß → heißest, frisch → frischest). Elsewhere the bare "-st" (jung → jüngst,
 * schnell → schnellst).
 *
 * An unstressed final syllable takes no -e-: the derivational -isch (semantisch → semantischst,
 * typisch → typischst) and the present participle's -end (spannend → spannendst). Both are told
 * from a stressed root (frisch, rund) by the syllable before them, so only a stem of more than one
 * syllable counts.
 */
export function deSuperlativeSuffix(stem: string): string {
  const syllables = stem.match(/[aeiouäöüy]+/gi)?.length ?? 0;
  // Swiss German's superlative is *-scht* (*gröscht*, *liebscht*), *-escht* after a dental or a hiss.
  if (syllables > 1 && /(isch|end)$/.test(stem)) return 'scht';
  return /(sch|[dtsz])$/.test(stem) ? 'escht' : 'scht';
}

/**
 * Agree a past participle with the subject (or, for avoir, with a preceding object):
 * allé → allée / allés / allées. A participle agrees like an adjective, so one already
 * ending in -s/-x has no separate masculine plural (compris, inclus, acquis) — the same
 * invariability agreeAdjFr applies to mauvais and heureux. The feminine is regular
 * throughout, because the -e comes between the two: comprise → comprises.
 */
export function agreeParticipleFr(base: string, subjectForms: Record<string, string>): string {
  if (!base) return '';
  const fem = (subjectForms['gender'] ?? 'masc') === 'fem';
  const plural = (subjectForms['number'] ?? 'singular') === 'plural';
  const stem = `${base}${fem ? 'e' : ''}`;
  return plural && !/[sxz]$/.test(stem) ? `${stem}s` : stem;
}

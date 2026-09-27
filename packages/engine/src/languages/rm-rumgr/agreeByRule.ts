/**
 * The regular agreement of a masculine-singular form (P04-E4, the style sheet): *-à → -ada, -ads,
 * -adas* (*mangià*), *-ì → -ida, -ids, -idas* (*vegnì*, *ì*), and after a consonant *+a, +s, +as*
 * (*fatg, fatga*). A final *-s* takes no plural *-s* (*mess, pers*). What a participle breaks, its
 * lexeme spells out (`participle_fem` …, see `agreeParticiple`).
 */
export function agreeByRule(base: string, fem: boolean, plural: boolean): string {
  if (!fem && !plural) return base;
  const accented = /[àì]$/.exec(base);
  if (accented) {
    const stem = `${base.slice(0, -1)}${accented[0] === 'à' ? 'a' : 'i'}d`;
    return `${stem}${fem ? 'a' : ''}${plural ? 's' : ''}`;
  }
  if (/[aeiou]$/.test(base)) return plural ? `${base}s` : base;
  if (!fem) return base.endsWith('s') ? base : `${base}s`;
  return `${base}a${plural ? 's' : ''}`;
}

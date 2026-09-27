/**
 * The regular agreement of a masculine-singular form (the style sheet): *-à → -ada, -ats, -adas*
 * (*mangià*), *-ü → -üda, -üts, -üdas* (*gnü*), *-i / -ì → -ida, -its, -idas* (*i*, *parti*), and after
 * a consonant *+a, +s, +as* (*mort, morta*). A final *-s* takes no plural *-s* (*miss, pers*). What a
 * participle breaks, its lexeme spells out (`participle_fem` …, see `agreeParticiple`).
 */
export function agreeByRule(base: string, fem: boolean, plural: boolean): string {
  if (!fem && !plural) return base;
  const vowel = /(?:à|ü|ì|(?<![aeiouàèìòùöü])i)$/.exec(base);
  if (vowel) {
    const stem = `${base.slice(0, -1)}${vowel[0] === 'à' ? 'a' : vowel[0] === 'ü' ? 'ü' : 'i'}`;
    return fem ? `${stem}da${plural ? 's' : ''}` : `${stem}ts`;
  }
  if (/[aeiou]$/.test(base)) return plural ? `${base}s` : base;
  if (!fem) return base.endsWith('s') ? base : `${base}s`;
  return `${base}a${plural ? 's' : ''}`;
}

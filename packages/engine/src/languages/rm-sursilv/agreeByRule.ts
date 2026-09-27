/**
 * The regular agreement of a masculine-singular form (style sheet): the participles *-au → -ada, -ai,
 * -adas* (*magliau*) and *-iu → -ida, -i, -idas* (*vegniu*, *iu*), and after anything else *+a, +s,
 * +as* (*fatg, fatga*). A final *-s* takes no plural *-s* (*bass*). A multiword form (*iu ora*, *sesiu
 * giu*) agrees on its first word. What a participle breaks, its lexeme spells out (`participle_fem` …,
 * see `agreeParticiple`).
 */
export function agreeByRule(base: string, fem: boolean, plural: boolean): string {
  if (!fem && !plural) return base;
  const space = base.indexOf(' ');
  if (space > 0) return `${agreeByRule(base.slice(0, space), fem, plural)}${base.slice(space)}`;
  const participle = /([ai])u$/.exec(base);
  if (participle) {
    const stem = base.slice(0, -2);
    const vowel = participle[1]!;
    if (!fem) return `${stem}${vowel === 'a' ? 'ai' : 'i'}`;
    return `${stem}${vowel}da${plural ? 's' : ''}`;
  }
  if (/[aeiou]$/.test(base)) return plural ? `${base}s` : base;
  if (!fem) return base.endsWith('s') ? base : `${base}s`;
  return `${base}a${plural ? 's' : ''}`;
}

/**
 * The predicative masculine singular of a participle (style sheet: "el ei vegnius", "el ei staus"):
 * the form with the predicative *-s*, derived — never stored — on the first word of a multiword one
 * ("el ei ius ora"). A form already in *-s* keeps it.
 */
export function predicativeParticiple(base: string): string {
  const space = base.indexOf(' ');
  const first = space > 0 ? base.slice(0, space) : base;
  const rest = space > 0 ? base.slice(space) : '';
  return `${first.endsWith('s') ? first : `${first}s`}${rest}`;
}

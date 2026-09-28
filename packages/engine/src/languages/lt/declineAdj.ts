import type { Agr, Case } from './lt.types.js';

/** The four agreement columns an adjective's endings are written in: masc, fem, masc plural, fem plural. */
type Column = 0 | 1 | 2 | 3;

/** The endings of one class by case, each row `[masc, fem, masc plural, fem plural]`. */
type Row = readonly [string, string, string, string];
type Table = Record<Exclude<Case, 'voc'>, Row>;

/*
 * The adjective classes (P18 §2.1, style-lt.md), each ending written after a marker: `s` the plain stem
 * (*ger-*, *graž-*, *didel-*), `k` the soft stem before a back vowel (*graži-*, *saldži-*, *dideli-*;
 * the *-ias* class's stem is soft throughout: *žali-*).
 */
const AS: Table = {
  nom: ['s:as', 's:a', 's:i', 's:os'],
  gen: ['s:o', 's:os', 's:ų', 's:ų'],
  dat: ['s:am', 's:ai', 's:iems', 's:oms'],
  acc: ['s:ą', 's:ą', 's:us', 's:as'],
  ins: ['s:u', 's:a', 's:ais', 's:omis'],
  loc: ['s:ame', 's:oje', 's:uose', 's:ose'],
};
const IAS: Table = {
  nom: ['k:as', 'k:a', 'k:', 'k:os'],
  gen: ['k:o', 'k:os', 'k:ų', 'k:ų'],
  dat: ['k:am', 'k:ai', 'k:ems', 'k:oms'],
  acc: ['k:ą', 'k:ą', 'k:us', 'k:as'],
  ins: ['k:u', 'k:a', 'k:ais', 'k:omis'],
  loc: ['k:ame', 'k:oje', 'k:uose', 'k:ose'],
};
const US: Table = {
  nom: ['s:us', 's:i', 's:ūs', 'k:os'],
  gen: ['s:aus', 'k:os', 'k:ų', 'k:ų'],
  dat: ['k:am', 'k:ai', 'k:ems', 'k:oms'],
  acc: ['s:ų', 'k:ą', 'k:us', 'k:as'],
  ins: ['k:u', 'k:a', 'k:ais', 'k:omis'],
  loc: ['k:ame', 'k:oje', 'k:uose', 'k:ose'],
};
const IS: Table = {
  nom: ['s:is', 's:ė', 'k:', 's:ės'],
  gen: ['k:o', 's:ės', 'k:ų', 'k:ų'],
  dat: ['k:am', 's:ei', 'k:ems', 's:ėms'],
  acc: ['s:į', 's:ę', 'k:us', 's:es'],
  ins: ['k:u', 's:e', 'k:ais', 's:ėmis'],
  loc: ['k:ame', 's:ėje', 'k:uose', 's:ėse'],
};

/** *t → č*, *d → dž* before *i* + a back vowel (*saldus → saldžiam*, *jaunutis → jaunučio*). */
function soften(stem: string): string {
  if (stem.endsWith('t')) return `${stem.slice(0, -1)}č`;
  if (stem.endsWith('d')) return `${stem.slice(0, -1)}dž`;
  return stem;
}

/** The class a masculine nominative declines in, and its plain and soft stems. */
function classOf(base: string): { table: Table; stem: string; soft: string } | undefined {
  const m = /^(.*?)(ias|as|us|is)$/.exec(base);
  if (!m) return undefined;
  const stem = m[1]!;
  switch (m[2]) {
    case 'ias': return { table: IAS, stem: `${stem}i`, soft: `${stem}i` };
    case 'as': return { table: AS, stem, soft: `${soften(stem)}i` };
    case 'us': return { table: US, stem, soft: `${soften(stem)}i` };
    default: return { table: IS, stem, soft: `${soften(stem)}i` };
  }
}

/**
 * A plain (not pronominal, P18 D8) adjective declined by rule from its masculine nominative (P18
 * §2.1): the classes *-as* (*geras, gera, gero, geri*), *-ias* (*žalias, žalio, žali*), *-us* (*gražus,
 * gražaus, graži, gražiam*; *saldus → saldžiam*) and *-is* (*didelis, didelė, didelio*), which the
 * comparative *-esnis* and the superlative *-iausias* also follow. The genderless agreement (`neut`)
 * is the stored `neuter` in the nominative (*gera, gražu*), the masculine elsewhere. A base in none
 * of those endings (a loan, a phrase) is not declinable by rule and stands as it is.
 */
export function declineAdj(base: string, kase: Case, agr: Agr, neuter?: string): string {
  const c = kase === 'voc' ? 'nom' : kase;
  if (agr.gender === 'neut' && !agr.plural && c === 'nom') return neuter ?? base;
  const cls = classOf(base);
  if (!cls) return base;
  const column: Column = agr.plural ? (agr.gender === 'fem' ? 3 : 2) : agr.gender === 'fem' ? 1 : 0;
  const [marker, ending] = cls.table[c][column].split(':') as [string, string];
  return `${marker === 'k' ? cls.soft : cls.stem}${ending}`;
}

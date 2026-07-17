import type { PronominalPossessor, RubySegment } from './types.js';

/**
 * Possessive determiners for a *pronominal* possessor ("the boy and **his** horse") — the
 * surface of a possessive pronoun, derived in-engine from the antecedent's grammatical features
 * plus (in the languages that agree) the possessed head's gender/number. No lexicon is seeded;
 * this mirrors the in-engine derivation of `mood.ts`.
 *
 * A pronominal possessor carries the antecedent's **person / number / (natural) gender** — the
 * features the pronoun agrees *with*. English and German spell the word from those features alone
 * (his/her/its, sein/ihr); the Romance languages *also* agree the possessive with the possessed
 * head in gender/number ("il **suo** cavallo", "la **sua** casa"), so there 3rd-singular his/her
 * collapse into one form. Japanese juxtaposes the antecedent pronoun + の.
 *
 * Each helper returns just the possessive word(s); the article that precedes it in Italian and
 * Portuguese ("**il** suo cane", "**o** seu cão") stays the engine's own job, so it can reuse that
 * engine's article machinery and elision.
 */

/** person + number, the key most possessive paradigms are indexed by. */
type PN = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';

/** Grammatical gender/number of the possessed head — the Romance/German agreement target. */
export interface PossessedAgreement {
  gender: 'masc' | 'fem' | 'neut';
  number: 'singular' | 'plural';
}

function pn(feats: PronominalPossessor): PN {
  const n = feats.number === 'plural' ? 'pl' : 'sg';
  return `${feats.person}${n}` as PN;
}

// ── English ─────────────────────────────────────────────────────────────────
// Invariant of the possessed. Only 3rd-singular splits on the antecedent's gender.
export function possessiveEn(feats: PronominalPossessor): string {
  if (pn(feats) === '3sg') {
    return feats.gender === 'fem' ? 'her' : feats.gender === 'neut' ? 'its' : 'his';
  }
  const table: Record<PN, string> = {
    '1sg': 'my', '2sg': 'your', '3sg': 'his',
    '1pl': 'our', '2pl': 'your', '3pl': 'their',
  };
  return table[pn(feats)];
}

// ── Italian ─────────────────────────────────────────────────────────────────
// Agrees with the possessed in gender/number (masc-sg / fem-sg / masc-pl / fem-pl); "loro" is
// invariable. Irregular masc-plurals miei/tuoi/suoi are spelled out rather than rule-derived.
const IT: Record<PN, [string, string, string, string] | string> = {
  '1sg': ['mio', 'mia', 'miei', 'mie'],
  '2sg': ['tuo', 'tua', 'tuoi', 'tue'],
  '3sg': ['suo', 'sua', 'suoi', 'sue'],
  '1pl': ['nostro', 'nostra', 'nostri', 'nostre'],
  '2pl': ['vostro', 'vostra', 'vostri', 'vostre'],
  '3pl': 'loro',
};

function romanceIndex(agree: PossessedAgreement): 0 | 1 | 2 | 3 {
  const fem = agree.gender === 'fem';
  const plural = agree.number === 'plural';
  return (plural ? (fem ? 3 : 2) : fem ? 1 : 0) as 0 | 1 | 2 | 3;
}

export function possessiveIt(feats: PronominalPossessor, agree: PossessedAgreement): string {
  const forms = IT[pn(feats)];
  return typeof forms === 'string' ? forms : forms[romanceIndex(agree)];
}

// ── French ──────────────────────────────────────────────────────────────────
// Agrees with the possessed. In the singular masc/fem split (mon/ma, son/sa); mon/ton/son also
// stand in before a vowel-initial feminine ("mon amie"). The plural is gender-invariant.
const FR: Record<PN, { masc: string; fem: string; plural: string }> = {
  '1sg': { masc: 'mon', fem: 'ma', plural: 'mes' },
  '2sg': { masc: 'ton', fem: 'ta', plural: 'tes' },
  '3sg': { masc: 'son', fem: 'sa', plural: 'ses' },
  '1pl': { masc: 'notre', fem: 'notre', plural: 'nos' },
  '2pl': { masc: 'votre', fem: 'votre', plural: 'vos' },
  '3pl': { masc: 'leur', fem: 'leur', plural: 'leurs' },
};

export function possessiveFr(
  feats: PronominalPossessor,
  agree: PossessedAgreement,
  vowelLead: boolean,
): string {
  const f = FR[pn(feats)];
  if (agree.number === 'plural') return f.plural;
  // Before a vowel a feminine possessed takes the masculine form (mon/ton/son), for euphony.
  if (agree.gender === 'fem') return vowelLead ? f.masc : f.fem;
  return f.masc;
}

// ── Spanish ─────────────────────────────────────────────────────────────────
// mi/tu/su agree only in number (mi/mis); nuestro/vuestro also in gender.
const ES: Record<PN, [string, string, string, string] | { sg: string; pl: string }> = {
  '1sg': { sg: 'mi', pl: 'mis' },
  '2sg': { sg: 'tu', pl: 'tus' },
  '3sg': { sg: 'su', pl: 'sus' },
  '1pl': ['nuestro', 'nuestra', 'nuestros', 'nuestras'],
  '2pl': ['vuestro', 'vuestra', 'vuestros', 'vuestras'],
  '3pl': { sg: 'su', pl: 'sus' },
};

export function possessiveEs(feats: PronominalPossessor, agree: PossessedAgreement): string {
  const forms = ES[pn(feats)];
  if (Array.isArray(forms)) return forms[romanceIndex(agree)];
  return agree.number === 'plural' ? forms.pl : forms.sg;
}

// ── Portuguese ───────────────────────────────────────────────────────────────
// Agrees with the possessed in gender/number. 2nd person maps to seu/sua (the seed's "você" is
// grammatically 3rd person); 3rd person likewise takes seu/sua — the dele/dela alternative, which
// would instead encode the antecedent's gender, is a deliberate gap (see the plan's known gaps).
const PT: Record<PN, [string, string, string, string]> = {
  '1sg': ['meu', 'minha', 'meus', 'minhas'],
  '2sg': ['seu', 'sua', 'seus', 'suas'],
  '3sg': ['seu', 'sua', 'seus', 'suas'],
  '1pl': ['nosso', 'nossa', 'nossos', 'nossas'],
  '2pl': ['seu', 'sua', 'seus', 'suas'],
  '3pl': ['seu', 'sua', 'seus', 'suas'],
};

export function possessivePt(feats: PronominalPossessor, agree: PossessedAgreement): string {
  return PT[pn(feats)][romanceIndex(agree)];
}

// ── German ──────────────────────────────────────────────────────────────────
// An ein-word possessive: a stem picked from the antecedent's features, then declined for the
// possessed head's case/gender/number exactly like ein/kein. euer drops its -e- before an ending
// (euer → eure), unser keeps it (unsere).
type Case = 'nom' | 'acc' | 'dat' | 'gen';

const DE_STEM: Record<PN, string> = {
  '1sg': 'mein', '2sg': 'dein', '3sg': 'sein', // 3sg fem overridden to "ihr" below
  '1pl': 'unser', '2pl': 'euer', '3pl': 'ihr',
};

// The ein-word ending by case × (masc/fem/neut/plural) — identical to ein/kein declension.
const DE_ENDING: Record<Case, { masc: string; fem: string; neut: string; plural: string }> = {
  nom: { masc: '', fem: 'e', neut: '', plural: 'e' },
  acc: { masc: 'en', fem: 'e', neut: '', plural: 'e' },
  dat: { masc: 'em', fem: 'er', neut: 'em', plural: 'en' },
  gen: { masc: 'es', fem: 'er', neut: 'es', plural: 'er' },
};

export function possessiveDe(
  feats: PronominalPossessor,
  _case: Case,
  agree: PossessedAgreement,
): string {
  let stem = DE_STEM[pn(feats)];
  if (pn(feats) === '3sg' && feats.gender === 'fem') stem = 'ihr';
  const ending =
    agree.number === 'plural' ? DE_ENDING[_case].plural : DE_ENDING[_case][agree.gender];
  if (!ending) return stem;
  // euer → eur- before an ending; unser keeps its stem.
  const base = stem === 'euer' ? 'eur' : stem;
  return `${base}${ending}`;
}

// ── Japanese ─────────────────────────────────────────────────────────────────
// The antecedent pronoun (with its furigana) + の. Invariant of the possessed.
const JA: Record<PN, RubySegment> = {
  '1sg': { t: '私', r: 'わたし' },
  '2sg': { t: 'あなた' },
  '3sg': { t: '彼', r: 'かれ' }, // fem/neut overridden below
  '1pl': { t: '私たち', r: 'わたしたち' },
  '2pl': { t: 'あなたたち' },
  '3pl': { t: '彼ら', r: 'かれら' },
};

export function possessiveJa(feats: PronominalPossessor): RubySegment[] {
  let pronoun = JA[pn(feats)];
  if (pn(feats) === '3sg') {
    if (feats.gender === 'fem') pronoun = { t: '彼女', r: 'かのじょ' };
    else if (feats.gender === 'neut') pronoun = { t: 'それ' };
  }
  return [pronoun, { t: 'の' }];
}

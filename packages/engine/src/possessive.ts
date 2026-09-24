import { isGenericBound } from './functions/boundPossessor.js';
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

/**
 * The determiners a possessive stands *beside* rather than replaces (A187). A possessive fills the
 * determiner slot of a definite or bare head ("her book", "il suo libro"), but a demonstrative, a
 * quantifier or the indefinite article keeps its slot and pushes the possessive somewhere else —
 * behind the noun in French, German, English, Spanish and Portuguese ("ce livre à elle", "dieses
 * Buch von ihr", "this book of hers", "este libro suyo", "este livro seu"; "un ami à moi", "ein
 * Freund von mir", "a friend of mine", "un amigo mío", "um amigo meu"), stacked after it in Italian
 * ("questo suo libro", "un mio amico"). The indefinite joined in A277: before, "a friend of mine"
 * came out "my friend", a definite phrase. `all` is not one of them: it prefixes the possessive
 * rather than standing in for it ("all her books", "tous ses livres", "alle ihre Bücher"), and each
 * noun phrase adds it itself — except Italian, which does stack the two ("tutti i suoi libri").
 */
export const KEPT_BESIDE_POSSESSIVE: ReadonlySet<string> =
  new Set(['this', 'that', 'some', 'many', 'few', 'no', 'indefinite',
    // P09-E25's seven keep their slot too: "each book of hers", "ogni suo libro".
    'each', 'every', 'both', 'most', 'several', 'enough', 'such']);

/** Grammatical gender/number of the possessed head — the Romance/German agreement target. */
export interface PossessedAgreement {
  gender: 'masc' | 'fem' | 'neut';
  number: 'singular' | 'plural';
}

function pn(feats: PronominalPossessor): PN {
  const n = feats.number === 'plural' ? 'pl' : 'sg';
  return `${feats.person}${n}` as PN;
}

/**
 * The possessor a personal pronoun's forms stand for, for a construction that turns the pronoun
 * itself into a possessive: "par **ma** faute", "per colpa **mia**", "durch **meine** Schuld". A
 * person other than 1st or 2nd is the 3rd, and a gender outside the three is left off.
 */
export function pronounPossessor(forms: Record<string, string>): PronominalPossessor {
  const { person, gender } = forms;
  return {
    kind: 'pronominal',
    person: person === '1' || person === '2' ? person : '3',
    number: forms['number'] === 'plural' ? 'plural' : 'singular',
    ...(gender === 'masc' || gender === 'fem' || gender === 'neut' ? { gender } : {}),
  };
}

// ── English ─────────────────────────────────────────────────────────────────
// Invariant of the possessed. Only 3rd-singular splits on the antecedent's gender.
export function possessiveEn(feats: PronominalPossessor): string {
  // A possessor linked to the generic subject: "one sees one's book" (A332).
  if (isGenericBound(feats)) return "one's";
  if (pn(feats) === '3sg') {
    return feats.gender === 'fem' ? 'her' : feats.gender === 'neut' ? 'its' : 'his';
  }
  const table: Record<PN, string> = {
    '1sg': 'my', '2sg': 'your', '3sg': 'his',
    '1pl': 'our', '2pl': 'your', '3pl': 'their',
  };
  return table[pn(feats)];
}

/**
 * The *independent* English possessive ("this book of **hers**"). The dependent my/her/their fills
 * the determiner slot, so a head that keeps a determiner of its own needs this form instead, in the
 * of-genitive A184 built for a genitive possessor (A187).
 */
export function possessiveEnIndependent(feats: PronominalPossessor): string {
  // *one's* has no independent form of its own: "a book of one's own" (A332).
  if (isGenericBound(feats)) return "one's own";
  if (pn(feats) === '3sg') {
    return feats.gender === 'fem' ? 'hers' : feats.gender === 'neut' ? 'its' : 'his';
  }
  const table: Record<PN, string> = {
    '1sg': 'mine', '2sg': 'yours', '3sg': 'his',
    '1pl': 'ours', '2pl': 'yours', '3pl': 'theirs',
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
const IT_GENERIC: [string, string, string, string] = ['proprio', 'propria', 'propri', 'proprie'];

function romanceIndex(agree: PossessedAgreement): 0 | 1 | 2 | 3 {
  const fem = agree.gender === 'fem';
  const plural = agree.number === 'plural';
  return (plural ? (fem ? 3 : 2) : fem ? 1 : 0) as 0 | 1 | 2 | 3;
}

export function possessiveIt(feats: PronominalPossessor, agree: PossessedAgreement): string {
  // Impersonal *si* binds only *proprio*, agreeing with the head as *suo* does: "si vede il proprio
  // libro", where "il suo libro" is someone else's (A332).
  const forms = isGenericBound(feats) ? IT_GENERIC : IT[pn(feats)];
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

/**
 * The disjunctive pronoun French puts after "à" when the possessive cannot have the determiner
 * slot: "ce livre **à elle**", "cette maison **à moi**" (A187).
 */
export function disjunctiveFr(feats: PronominalPossessor): string {
  if (pn(feats) === '3sg') return feats.gender === 'fem' ? 'elle' : 'lui';
  if (pn(feats) === '3pl') return feats.gender === 'fem' ? 'elles' : 'eux';
  const table: Record<PN, string> = {
    '1sg': 'moi', '2sg': 'toi', '3sg': 'lui',
    '1pl': 'nous', '2pl': 'vous', '3pl': 'eux',
  };
  return table[pn(feats)];
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

/**
 * The *stressed* Spanish possessive, the postnominal counterpart of the prenominal mi/tu/su:
 * "este libro **suyo**", "esta casa **mía**" (A187). It agrees with the possessed head in gender as
 * well as number, which the unstressed singular forms do not, so it is keyed by the prenominal
 * surface the noun phrase was handed — `es/nounPhrase` receives the possessive as a word, not as the
 * possessor's features. nuestro/vuestro are already stressed and map to themselves.
 */
const ES_STRESSED: Record<string, [string, string, string, string]> = {
  mi: ['mío', 'mía', 'míos', 'mías'],
  tu: ['tuyo', 'tuya', 'tuyos', 'tuyas'],
  su: ['suyo', 'suya', 'suyos', 'suyas'],
  nuestro: ['nuestro', 'nuestra', 'nuestros', 'nuestras'],
  vuestro: ['vuestro', 'vuestra', 'vuestros', 'vuestras'],
};

const ES_STRESSED_DEFAULT: [string, string, string, string] = ['suyo', 'suya', 'suyos', 'suyas'];

export function possessiveEsStressed(unstressed: string, agree: PossessedAgreement): string {
  // mis/tus/sus and nuestra/nuestros/… all reduce to their paradigm's key.
  const key = unstressed.replace(/s$/, '').replace(/[ao]$/, 'o');
  return (ES_STRESSED[key] ?? ES_STRESSED_DEFAULT)[romanceIndex(agree)];
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

/**
 * The dative personal pronoun German puts after "von" when the possessive cannot have the
 * determiner slot: "dieses Buch **von ihr**", "einige Bücher **von mir**" (A187).
 */
export function dativePronounDe(feats: PronominalPossessor): string {
  if (pn(feats) === '3sg') return feats.gender === 'fem' ? 'ihr' : 'ihm';
  const table: Record<PN, string> = {
    '1sg': 'mir', '2sg': 'dir', '3sg': 'ihm',
    '1pl': 'uns', '2pl': 'euch', '3pl': 'ihnen',
  };
  return table[pn(feats)];
}

// ── Japanese ─────────────────────────────────────────────────────────────────
// The antecedent pronoun (with its furigana) + の, for the nine cells that have a regular genitive.
// Invariant of the possessed. The tenth, the 3rd-singular neuter, is suppletive: それ's adnominal is
// **その**, never それの, as この / その / あの are the whole of that series (A201).
const JA: Record<PN, RubySegment> = {
  '1sg': { t: '私', r: 'わたし' },
  '2sg': { t: 'あなた' },
  '3sg': { t: '彼', r: 'かれ' }, // fem/neut overridden below
  '1pl': { t: '私たち', r: 'わたしたち' },
  '2pl': { t: 'あなたたち' },
  '3pl': { t: '彼ら', r: 'かれら' },
};

export function possessiveJa(feats: PronominalPossessor): RubySegment[] {
  // その is the adnominal whole: the shared tail below is exactly the の this cell must not take.
  if (pn(feats) === '3sg' && feats.gender === 'neut') return [{ t: 'その' }];
  let pronoun = JA[pn(feats)];
  // The 3rd person is the one that genders: 彼女 in the singular, 彼女ら in the feminine plural
  // (A161) and それら in the neuter plural, whose adnominal IS regular (それらの). The masculine and
  // mixed plural keep 彼ら. それら and その are kana and carry no reading.
  if (pn(feats) === '3sg') {
    if (feats.gender === 'fem') pronoun = { t: '彼女', r: 'かのじょ' };
  } else if (pn(feats) === '3pl') {
    if (feats.gender === 'fem') pronoun = { t: '彼女ら', r: 'かのじょら' };
    else if (feats.gender === 'neut') pronoun = { t: 'それら' };
  }
  return [pronoun, { t: 'の' }];
}

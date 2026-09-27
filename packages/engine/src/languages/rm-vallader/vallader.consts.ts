import type { CoordConjunction, Degree, DimensionRelation, MannerRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Vallader (P04-E8). Every word in this file is *(verify)* until the variety's review (P04-E19); the
// spellings follow `docs/features/P-planning/P04-romansh/style-rm-vallader.md`. Where the style sheet
// is silent the word is the author's draft, and says so.

/**
 * The preposition each manner relation takes: similative *sco* ("sco il vent"), means *cun*, measure
 * *a*, mode *in* ("in üna maniera buna"). Only *a* contracts with the article here (`prepDet`); *in*
 * contracts too (*i'l, illa*), through `prepArt`.
 */
export const VL_MANNER_PREP: Record<MannerRelation, 'sco' | 'cun' | 'a' | 'in'> = { similative: 'sco', means: 'cun', measure: 'a', mode: 'in' };

/**
 * How each temporal relation is spelled (C29). `prep` is a simple preposition that contracts with
 * the article where Vallader contracts (*a*, *da*, *in*: "al di", "dal di", "i'l di"); `word` is an
 * invariable word in front of it. *ago* is *avant* before the phrase: "avant ün di" (verify). *davo*
 * (after), *dürant*, *tanter*, *daspö*, *infra* are the author's draft (verify). The `at` row's *a* is
 * only the fallback — a noun naming its own `temporal_prep` wins ("in quist di").
 */
export const VL_TEMPORAL: Record<TemporalRelation, { word?: string; prep?: 'a' | 'da' | 'in'; postposed?: string }> = {
  at: { prep: 'a' },
  ago: { word: 'avant' },
  until: { word: 'fin', prep: 'a' },
  after: { word: 'davo' },
  before: { word: 'avant' },
  during: { word: 'dürant' },
  between: { word: 'tanter' },
  since: { word: 'daspö' },
  within: { word: 'infra' },
  for: { word: 'per' },
};

/**
 * The degree adverb before the (agreed) adjective: *plü* (more), *il plü* (most, the article the noun
 * phrase's), *main* (less), *uschè* (as). Comparative and relative superlative share the adverb; the
 * definite article tells them apart ("il giat plü grond").
 */
export const VL_DEGREE: Record<Degree, string> = {
  positive: '', more: 'plü', most: 'plü', less: 'main', least: 'main', equally: 'uschè',
};

/** The equative before a standard: *uschè grond sco il chan*. */
export const VL_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'uschè' };

/**
 * The word before the standard of comparison, by degree (P09-E5): *co* after the comparatives ("plü
 * grond co il chan" — Vallader's *co*, where RG says *che*; the author's draft, verify), *sco* after
 * the equative. Neither contracts with the article.
 */
export const VL_STANDARD: Partial<Record<Degree, 'co' | 'sco'>> = { more: 'co', less: 'co', equally: 'sco' };

/** The word before the set a superlative selects from (P09-E19): *da*, "il plü grond dals animals". */
export const VL_DOMAIN = 'da';

/**
 * A word that begins with a vowel — or with *h* and a vowel, which Vallader elides before as before a
 * vowel (the style sheet's *l'hom*; *el nun ha*). *ü* and *ö* are vowels.
 */
export const VOWEL_START = /^h?[aeiouàèéìòùâêîôûöü]/i;

/**
 * The adjectives that precede the noun without qualifying it — ordinals, OTHER, SAME, NEXT, the final
 * LAST, the genuine REAL, OWN, SOLE. Their lexemes say `position: 'pre'` like the qualifying ones
 * (*grond, bun, bel*), but they do not compete for the one qualifying slot before the noun (see
 * `splitAdjectives`): "ün oter grond giat".
 */
export const PRENOMINAL_DETERMINER = new Set(['FIRST', 'SECOND', 'THIRD', 'NEXT', 'OTHER', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE', 'REAL_GENUINE', 'SOLE']);

/**
 * The linking preposition of an attributive noun, by relation: feature *a*, purpose *da*, material
 * *da*, and the `domain`'s *da*, which contracts with the generic definite article ("dal").
 */
export const REL_PREP_VL: Record<ModifierRelation, 'a' | 'da'> = { feature: 'a', purpose: 'da', material: 'da', domain: 'da' };

/** Person/number cells of one auxiliary in each tense the engine needs from it. */
type AuxTable = Record<'present' | 'imperfect' | 'conditional' | 'subjunctive', Record<string, string>>;

const cells = (forms: readonly string[]): Record<string, string> =>
  Object.fromEntries(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'].map((pn, i) => [pn, forms[i]!]));

/**
 * *esser* (BE): the compound past's auxiliary of the verbs whose lexeme says `aux: 'be'` (P04 D5),
 * and the auxiliary of the progressive and prospective periphrases. As the style sheet's irregular
 * core and the column store it: 3sg ***es***, 1pl *eschan*, imperfect *d'eira*.
 */
export const ESSER_VL: AuxTable = {
  present: cells(['sun', 'est', 'es', 'eschan', 'eschat', 'sun']),
  imperfect: cells(["d'eira", "d'eirast", "d'eira", "d'eiran", "d'eirat", "d'eiran"]),
  conditional: cells(['füss', 'füssast', 'füss', 'füssan', 'füssat', 'füssan']),
  subjunctive: cells(['saja', 'sajast', 'saja', 'sajan', 'sajat', 'sajan']),
};

/** *avair* (HAVE): the compound past's auxiliary everywhere else. The 1sg is *n'ha* (the style sheet). */
export const AVAIR_VL: AuxTable = {
  present: cells(["n'ha", 'hast', 'ha', 'vain', 'vais', 'han']),
  imperfect: cells(['vaiva', 'vaivast', 'vaiva', 'vaivan', 'vaivat', 'vaivan']),
  conditional: cells(['vess', 'vessast', 'vess', 'vessan', 'vessat', 'vessan']),
  subjunctive: cells(['haja', 'hajast', 'haja', 'hajan', 'hajat', 'hajan']),
};

/** *gnir* (COME): the future's auxiliary, *eu vegn a mangiar* (P04 D7, the style sheet). */
export const GNIR_VL: AuxTable = {
  present: cells(['vegn', 'vainst', 'vain', 'gnin', 'gnis', 'vegnan']),
  imperfect: cells(['gniva', 'gnivast', 'gniva', 'gnivan', 'gnivat', 'gnivan']),
  conditional: cells(['gniss', 'gnissast', 'gniss', 'gnissan', 'gnissat', 'gnissan']),
  subjunctive: cells(['vegna', 'vegnast', 'vegna', 'vegnan', 'vegnat', 'vegnan']),
};

/** The infinitives of the two auxiliaries, for a modal chain or a citation. */
export const ESSER = 'esser';
export const AVAIR = 'avair';

/**
 * The progressive and prospective periphrases after *esser* (P04-E14 D1): *es landervia da mangiar*
 * (is eating), *es sül punct da mangiar* (is about to eat). The style sheet names neither; both are
 * the author's draft *(verify)*. *sül* is written as the fixed phrase Vallader has, though the noun
 * phrase keeps *sün il* apart (the style sheet does not list the contraction).
 */
export const PROGRESSIVE_FRAME = 'landervia da';
export const PROSPECTIVE_FRAME = 'sül punct da';

// The adposition an adjective-definition gloss wraps its dimension noun phrase in: extent and quality
// *da* ("da grond format"), measure *a*.
export const VL_DIM_PREP: Record<DimensionRelation, string> = { extent: 'da', quality: 'da', measure: 'a' };

// The fixed idiom a plain locative and a plain goal take on a hearth noun: *a chasa* for both, "el es a
// chasa", "el va a chasa" (see `locativeIdiom`, `directionIdiom`).
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'a chasa' };
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'a chasa' };

// The preposition of `between`, said once over a coordinated landmark (P09-E1 D2): *tanter*.
export const BETWEEN_PREP = 'tanter';

/**
 * The coordinators (P04 §2.3): *e, o, ma* — Vallader's *o* where RG says *u* (verify). P04-E15 D3's
 * open point: *e* stays *e* before a vowel (no euphonic *ed*, verify). The adverbial ones are the
 * author's draft: *numnadamaing* (that is), *perquai* (therefore), *e lura* (then), *tuottüna*
 * (however).
 */
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'o',
  but: 'ma',
  that_is: 'numnadamaing',
  therefore: 'perquai',
  then: 'e lura',
  however: 'tuottüna',
};

// The correlative pair of an "and" group (P09-E26): *tant il giat sco il chan* (verify).
export const CORRELATIVE_PAIR: readonly [string, string] = ['tant', 'sco'];

/**
 * The complementizer (that) and the if-word: Vallader *cha* and *scha*, where RG writes *che* and
 * *sche* (the author's draft, verify). Both elide before a vowel (*ch'el*, *sch'el*) and fuse with a
 * following *il / ils* (*cha'l giat*, *scha'ls chans*) — see `withChe`.
 */
export const THAT = 'cha';
export const IF = 'scha';

/**
 * The subordinating conjunctions (P09-E4), each ending in *cha* (see `withChe`). The mood each governs
 * is the translator's (`SUBJUNCTIVE_CONJUNCTIONS`): *avant cha* and *schabain cha* take the
 * subjunctive. Every word the author's draft (verify).
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, { word: string }> = {
  when: { word: 'cur cha' },
  while: { word: 'dürant cha' },
  because: { word: 'perquai cha' },
  after: { word: 'davo cha' },
  before: { word: 'avant cha' },
  until: { word: 'fin cha' },
  since: { word: 'daspö cha' },
  though: { word: 'schabain cha' },
  as: { word: 'sco' },
};

// A reflexive verb's clitic, agreeing with the subject (the column stores *as fermar*, *eu am ferm*,
// *el as ferma*): the engine places it itself where a cell does not carry it — before the auxiliary of
// the compound past ("el s'es fermà") and on an infinitive ("eu vögl am fermar").
export const VL_REFLEXIVE: Record<string, string> = { '1sg': 'am', '2sg': 'at', '3sg': 'as', '1pl': 'ans', '2pl': 'as', '3pl': 'as' };

/**
 * The clause's negation (P04-E11 D2, the style sheet): one particle **before** the verb group, *nu*,
 * *nun* before a vowel. *brich* after the verb is emphatic and optional, and never added.
 */
export const NEGATOR = 'nu';
export const NEGATOR_BEFORE_VOWEL = 'nun';

// The negator of a single constituent rather than of the clause: "el cuorra brich pervia dal chan"
// (the author's draft, verify).
export const CONSTITUENT_NEGATOR = 'brich';

/** The focus particles (C39), before the phrase: *be* (only, the column's ONLY), *perfin* (even, verify), *eir* (also). */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'be' }, even: { word: 'perfin' }, also: { word: 'eir' },
};

/** The cardinals (C31); *ün / üna* and *duos / duas* agree. The author's draft (verify). */
export const CARDINALS: CardinalTable = {
  1: { word: 'ün', fem: 'üna' }, 2: { word: 'duos', fem: 'duas' }, 3: { word: 'trais' }, 4: { word: 'quatter' },
  5: { word: 'tschinch' }, 6: { word: 'ses' }, 7: { word: 'set' }, 8: { word: 'ot' },
  9: { word: 'nouv' }, 10: { word: 'desch' }, 11: { word: 'ündesch' }, 12: { word: 'dudesch' },
  24: { word: 'vainchaquatter' },
};

/** The examples relation's words (P09-E33, E48): *sco* (such as), *inclus* (including, invariable, verify). */
export const VL_EXAMPLES: Record<'example' | 'inclusion', string> = { example: 'sco', inclusion: 'inclus' };

/** The tenses the aspect auxiliaries are conjugated in; `past` is the imperfect (E12 D3). */
export const AUX_TENSE: Record<Tense, 'present' | 'imperfect'> = { present: 'present', past: 'imperfect', future: 'present' };

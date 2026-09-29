import type { CoordConjunction, Degree, DimensionRelation, ModifierRelation, TemporalRelation } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Catalan (P03): Central Catalan in the IEC standard (P03 D1). Every word here is *(verify)* until the
// native review (P03-E11); `docs/features/O-open/P03-catalan/style-ca.md` is the style sheet.

/** The person-number keys the column stores every finite cell under. */
export type PN = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';

/** One auxiliary's finite cells, by tense or mood, as the column stores a verb's. */
export type AuxTable = Record<'present' | 'imperfect' | 'future' | 'conditional' | 'subjunctive' | 'past_subjunctive', Record<PN, string>>;

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative share
// "més" / "menys"; the noun phrase's definite article tells them apart ("un gat més gran", "el gat
// més gran"). Equality without a standard is "igual de" ("igual de gran").
export const CA_DEGREE: Record<Degree, string> = {
  positive: '', more: 'més', most: 'més', less: 'menys', least: 'menys', equally: 'igual de',
};

/** Before a standard the equative is the circumfix "tan … com": "tan gran com el gos" (P09-E5). */
export const CA_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'tan' };

/** The word before the standard of comparison: "més gran que el gos", "tan gran com el gos". */
export const CA_STANDARD: Partial<Record<Degree, string>> = { more: 'que', less: 'que', equally: 'com' };

/** The preposition before a superlative's set: "el més gran dels animals" (P09-E19). */
export const CA_DOMAIN = 'de';

/** An equative intensifier keeps "igual de", which takes "que": "igual de gran que el gos" (A255). */
export const CA_EQUATIVE_INTENSIFIER_STANDARD = 'que';

/**
 * The suppletive comparatives (P03 §2.1): *més bo* is *millor*, *més dolent* is *pitjor* — "un gat
 * millor", "el millor gat" is not built (the superlative stays postnominal: "el gat millor"). Keyed by
 * the Catalan base, as Portuguese's `PT_SUPPLETIVE` is; each is invariable in gender and takes -s in
 * the plural (*millors, pitjors*).
 */
export const CA_SUPPLETIVE: Record<string, string> = { bo: 'millor', dolent: 'pitjor' };

/**
 * Concept IDs of the adjectives that precede their noun, as in Spanish: the ordinals, OTHER ("l'altre
 * gat", "un altre gat"), NEW in its sense *another* ("una nova casa"), SAME ("el mateix dia"), the final
 * LAST ("l'últim dia"), OWN ("el seu propi gat") and the genuine REAL ("un veritable problema"). Every
 * other qualifying adjective follows the noun (P03 §2.1: *bon, gran* in fixed uses are always
 * postnominal here, a documented simplification).
 */
export const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD', 'OTHER', 'NEW', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE', 'REAL_GENUINE']);

/**
 * The adpositions that govern the subject pronoun, not the tonic one: the similative "com" ("corre com
 * jo") and "entre" ("entre tu i jo"). Catalan's tonic 1sg is *mi* ("amb mi"), so the two differ there.
 */
export const NOMINATIVE_PREP: ReadonlySet<string> = new Set(['com', 'entre']);

/** *estar*, the progressive's and prospective's auxiliary and the transient copula's finite cells. */
export const ESTAR: AuxTable = {
  present: { '1sg': 'estic', '2sg': 'estàs', '3sg': 'està', '1pl': 'estem', '2pl': 'esteu', '3pl': 'estan' },
  imperfect: { '1sg': 'estava', '2sg': 'estaves', '3sg': 'estava', '1pl': 'estàvem', '2pl': 'estàveu', '3pl': 'estaven' },
  future: { '1sg': 'estaré', '2sg': 'estaràs', '3sg': 'estarà', '1pl': 'estarem', '2pl': 'estareu', '3pl': 'estaran' },
  conditional: { '1sg': 'estaria', '2sg': 'estaries', '3sg': 'estaria', '1pl': 'estaríem', '2pl': 'estaríeu', '3pl': 'estarien' },
  subjunctive: { '1sg': 'estigui', '2sg': 'estiguis', '3sg': 'estigui', '1pl': 'estiguem', '2pl': 'estigueu', '3pl': 'estiguin' },
  past_subjunctive: { '1sg': 'estigués', '2sg': 'estiguessis', '3sg': 'estigués', '1pl': 'estiguéssim', '2pl': 'estiguéssiu', '3pl': 'estiguessin' },
};

/** *haver*, the resultative's auxiliary: "ha menjat", "havia menjat", "haurà menjat" (no agreement). */
export const HAVER: AuxTable = {
  present: { '1sg': 'he', '2sg': 'has', '3sg': 'ha', '1pl': 'hem', '2pl': 'heu', '3pl': 'han' },
  imperfect: { '1sg': 'havia', '2sg': 'havies', '3sg': 'havia', '1pl': 'havíem', '2pl': 'havíeu', '3pl': 'havien' },
  future: { '1sg': 'hauré', '2sg': 'hauràs', '3sg': 'haurà', '1pl': 'haurem', '2pl': 'haureu', '3pl': 'hauran' },
  conditional: { '1sg': 'hauria', '2sg': 'hauries', '3sg': 'hauria', '1pl': 'hauríem', '2pl': 'hauríeu', '3pl': 'haurien' },
  subjunctive: { '1sg': 'hagi', '2sg': 'hagis', '3sg': 'hagi', '1pl': 'hàgim', '2pl': 'hàgiu', '3pl': 'hagin' },
  past_subjunctive: { '1sg': 'hagués', '2sg': 'haguessis', '3sg': 'hagués', '1pl': 'haguéssim', '2pl': 'haguéssiu', '3pl': 'haguessin' },
};

/**
 * The periphrastic past's auxiliary (P03 D2), *anar*'s present in its auxiliary forms: "va menjar",
 * "vam menjar". The 1pl / 2pl are the short *vam, vau*, not the *vàrem, vàreu* the standard also admits.
 */
export const ANAR_PAST: Record<PN, string> = { '1sg': 'vaig', '2sg': 'vas', '3sg': 'va', '1pl': 'vam', '2pl': 'vau', '3pl': 'van' };

/** The prospective's frame between *estar* and the infinitive: "està a punt de menjar". */
export const PROSPECTIVE_FRAME = 'a punt de';

/** A finite table as a lexeme's cells (`1sg_present` …), so the copula swaps in like any verb. */
function cells(table: AuxTable): Record<string, string> {
  return Object.fromEntries(
    Object.entries(table).flatMap(([tense, row]) => Object.entries(row).map(([pn, form]) => [`${pn}_${tense}`, form])),
  );
}

/**
 * A47: the *copular* "estar" — the finite copula a transient predicate adjective takes ("el gat està
 * cansat"), shaped like the column's BE (ser) so `predicateText` swaps it in. A state: its past is the
 * imperfect ("estava cansat"). Location is *ser* in Catalan ("el gat és a la casa"), not estar: the
 * IEC standard locates with *ser*, where Spanish must use estar (P03-E4 decision, verify).
 */
export const ESTAR_COPULA: ConceptForms = {
  conceptId: 'ESTAR',
  forms: {
    base: 'estar', participle: 'estat', gerund: 'estant', stative: '1',
    ...cells(ESTAR),
    '2sg_imperative': 'estigues', '1pl_imperative': 'estiguem', '2pl_imperative': 'estigueu',
  },
};

/**
 * The existential *haver-hi* (P09-E6 D5): "hi ha un gat", conjugated in place of the HAVE (tenir) an
 * existential is resolved with. Impersonal — only the third singular is read, "hi ha gats" (the
 * standard keeps it singular). A state, so its past is "hi havia". Its *hi* is a proclitic the verb
 * group places (`EXISTENTIAL_CLITIC`): "no hi ha cap gat", "hi pot haver un gat" is left as "pot
 * haver-hi un gat".
 */
export const HAVER_EXISTENTIAL: ConceptForms = {
  conceptId: 'HAVER',
  forms: {
    base: 'haver', participle: 'hagut', gerund: 'havent', stative: '1',
    ...cells(HAVER),
    '3sg_present': 'ha',
  },
};

/** The locative clitic the existential takes: *hi* ha. */
export const EXISTENTIAL_CLITIC = 'hi';

// A reflexive verb's clitic, agreeing with the subject: em / et / es / ens / us / es (P03 §2.2). The
// column stores *tornar-se* and the finite cells with their proclitic (*es torna*, *s'atura*); the
// engine strips it and places the subject's own (`reflexiveClitic`).
export const CA_REFLEXIVE: Record<PN, string> = { '1sg': 'em', '2sg': 'et', '3sg': 'es', '1pl': 'ens', '2pl': 'us', '3pl': 'es' };

/** Every attributive-noun relation is linked with "de" ("vaixell de vela", "mosca de la fruita"). */
export const REL_PREP_CA: Record<ModifierRelation, string> = { feature: 'de', purpose: 'de', material: 'de', domain: 'de' };

/** The adjective-definition gloss's adposition: extent / quality "de" (de gran mida), measure "a". */
export const CA_DIM_PREP: Record<DimensionRelation, string> = { extent: 'de', quality: 'de', measure: 'a' };

/** The hearth noun's locative idiom: a bare "a casa", not "a la llar". */
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'a casa' };

/** …and its goal: "va a casa". */
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'a casa' };

/** The preposition of `between`, said once over a coordinated landmark (P09-E1 D2). */
export const BETWEEN_PREP = 'entre';

/**
 * The clause conjunctions. *I* and *o* never change form before a vowel (unlike es *y → e*, *o → u*).
 * *then* is "i després" and *therefore* "per tant", so the two selectors stay apart.
 */
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'i',
  or: 'o',
  but: 'però',
  that_is: 'és a dir',
  therefore: 'per tant',
  then: 'i després',
  however: 'tanmateix',
};

/** The correlative pair of an "and" group (P09-E26): "tant el gat com el gos". */
export const CORRELATIVE_PAIR: readonly [string, string] = ['tant', 'com'];

/**
 * The subordinating conjunctions (P09-E4). *abans que* and *fins que* govern the subjunctive, which the
 * translator resolves the clause in (SUBJUNCTIVE_CONJUNCTIONS); *tot i que* asserts its clause and
 * keeps the indicative, as Spanish *aunque* does.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'quan', while: 'mentre', because: 'perquè', after: 'després que', before: 'abans que',
  until: 'fins que', since: 'des que', though: 'tot i que',
  as: 'com',
};

/** The discourse connectors, set off by a comma after them as well as before ("…, és a dir, …"). */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is', 'however', 'therefore']);

// The constituent negator: "corre no a causa del gos" (see `Complement.negative`).
export const CONSTITUENT_NEGATOR = 'no';

/** The focus particles (C39), all before the phrase: "només el gat", "fins i tot el gat", "també el gat". */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'només' }, even: { word: 'fins i tot' }, also: { word: 'també' },
};

/** The cardinals Catalan spells (C31); *un / una* and *dos / dues* agree. */
export const CARDINALS: CardinalTable = {
  1: { word: 'un', fem: 'una' }, 2: { word: 'dos', fem: 'dues' }, 3: { word: 'tres' }, 4: { word: 'quatre' },
  5: { word: 'cinc' }, 6: { word: 'sis' }, 7: { word: 'set' }, 8: { word: 'vuit' },
  9: { word: 'nou' }, 10: { word: 'deu' }, 11: { word: 'onze' }, 12: { word: 'dotze' },
  24: { word: 'vint-i-quatre' },
};

/**
 * The temporal relations (C29). `de: true` marks the locutions ending in "de", which contract with a
 * definite article ("després del dia"); `a: true` the one ending in "a" ("fins al dia"). `at` reads the
 * head noun's `temporal_prep` and falls back on "en". "fa" (ago) is a verb standing where a
 * preposition would ("fa un moment").
 */
export const CA_TEMPORAL: Record<Exclude<TemporalRelation, 'at'>, { word: string; de?: boolean; a?: boolean }> = {
  ago: { word: 'fa' },
  until: { word: 'fins', a: true },
  after: { word: 'després', de: true },
  before: { word: 'abans', de: true },
  during: { word: 'durant' },
  between: { word: 'entre' },
  since: { word: 'des', de: true },
  within: { word: 'dins', de: true },
  for: { word: 'durant' },
};

/**
 * The examples relation (P09-E33, E48): *com* runs on ("animals com el gat"); *inclòs* agrees with
 * the example (*inclòs, inclosa, inclosos, incloses*); this is its masculine singular.
 */
export const CA_EXAMPLES: Record<'example' | 'inclusion', string> = { example: 'com', inclusion: 'inclòs' };

/** *inclòs* agreeing: masculine / feminine, singular / plural. */
export const CA_INCLUSION: [string, string, string, string] = ['inclòs', 'inclosa', 'inclosos', 'incloses'];

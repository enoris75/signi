import type { CoordConjunction, Degree, DimensionRelation, MannerRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Sursilvan (P04-E8, forked from the Rumantsch Grischun engine). Every word in this file is *(verify)*
// until the variety's review (P04-E19); the spellings follow
// `docs/features/P-planning/P04-romansh/style-rm-sursilv.md`, and where the style sheet is silent the
// word is the implementer's, marked so in the ticket's Done section.

/**
 * The preposition each manner relation takes: similative *sco* ("sco il vent"), means *cun*, measure
 * *a*, mode *en* ("en ina moda buna"). *a* and *en* contract with the masculine article (`prepArt`).
 */
export const SURSILV_MANNER_PREP: Record<MannerRelation, 'sco' | 'cun' | 'a' | 'en'> = { similative: 'sco', means: 'cun', measure: 'a', mode: 'en' };

/**
 * How each temporal relation is spelled (C29). `prep` is a simple preposition that contracts with
 * the masculine article (*a*, *da*, *en*: "al di", "dil di", "el di"); `word` is an invariable word in
 * front of it. *ago* is *avon* before the phrase, as a preposition: "avon in mument" (verify). The
 * `at` row's *a* is only the fallback — a noun naming its own `temporal_prep` wins ("en quei di").
 */
export const SURSILV_TEMPORAL: Record<TemporalRelation, { word?: string; prep?: 'a' | 'da' | 'en'; postposed?: string }> = {
  at: { prep: 'a' },
  ago: { word: 'avon' },
  until: { word: 'tochen' },
  after: { word: 'suenter' },
  before: { word: 'avon' },
  during: { word: 'duront' },
  between: { word: 'denter' },
  since: { word: 'dapi' },
  within: { word: 'entaifer' },
  for: { word: 'per' },
};

/**
 * The degree adverb before the (agreed) adjective (style sheet): *pli* (more), *il pli* (most, the
 * article the noun phrase's), *meins* (less), *aschi* (as, the column's VERY `equative`). Comparative
 * and relative superlative share the adverb; the definite article tells them apart.
 */
export const SURSILV_DEGREE: Record<Degree, string> = {
  positive: '', more: 'pli', most: 'pli', less: 'meins', least: 'meins', equally: 'aschi',
};

/** The equative before a standard: *aschi grond sco il tgaun*. */
export const SURSILV_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'aschi' };

/**
 * The word before the standard of comparison, by degree (P09-E5): *che* after the comparatives ("pli
 * gronds ch'il tgaun", eliding before a vowel), *sco* after the equative. Neither contracts.
 */
export const SURSILV_STANDARD: Partial<Record<Degree, 'che' | 'sco'>> = { more: 'che', less: 'che', equally: 'sco' };

/** The word before the set a superlative selects from (P09-E19): *da*, "il pli grond dils animals". */
export const SURSILV_DOMAIN = 'da';

export const VOWEL_START = /^[aeiouàèéìòùâêîôû]/i;

/**
 * The adjectives that precede the noun without qualifying it — ordinals, OTHER, SAME, NEXT, the final
 * LAST, OWN, SOLE. Their lexemes say `position: 'pre'` like the qualifying ones (*grond* GREAT, *bi*,
 * *vegl*), but they do not compete for the one qualifying slot before the noun (`splitAdjectives`):
 * "in auter bi gat".
 */
export const PRENOMINAL_DETERMINER = new Set(['FIRST', 'SECOND', 'THIRD', 'NEXT', 'NEXT_COMING', 'OTHER', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE', 'REAL_GENUINE', 'SOLE']);

/**
 * The linking preposition of an attributive noun, by relation: feature *a* ("barca a vela"), purpose
 * *da*, material *da*, and the `domain`'s *da*, which contracts with the generic definite article
 * ("la musica dil film").
 */
export const REL_PREP_SURSILV: Record<ModifierRelation, 'a' | 'da'> = { feature: 'a', purpose: 'da', material: 'da', domain: 'da' };

/** Person/number cells of one auxiliary in each tense the engine needs from it. */
type AuxTable = Record<'present' | 'imperfect' | 'conditional' | 'subjunctive', Record<string, string>>;

const cells = (forms: readonly string[]): Record<string, string> =>
  Object.fromEntries(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'].map((pn, i) => [pn, forms[i]!]));

/**
 * *esser* (BE): the compound past's auxiliary of the verbs whose lexeme says `aux: 'be'` (P04 D5),
 * and the auxiliary of the progressive and prospective periphrases. The style sheet's irregular core,
 * as the column's BE stores it.
 */
export const ESSER_SURSILV: AuxTable = {
  present: cells(['sun', 'eis', 'ei', 'essan', 'essas', 'ein']),
  imperfect: cells(['fuvel', 'fuvas', 'fuva', 'fuvan', 'fuvas', 'fuvan']),
  conditional: cells(['fuss', 'fusses', 'fuss', 'fussen', 'fusses', 'fussen']),
  subjunctive: cells(['seigi', 'seigies', 'seigi', 'seigien', 'seigies', 'seigien']),
};

/** *haver* (HAVE): the compound past's auxiliary everywhere else. */
export const HAVER_SURSILV: AuxTable = {
  present: cells(['hai', 'has', 'ha', 'havein', 'haveis', 'han']),
  imperfect: cells(['havevel', 'havevas', 'haveva', 'havevan', 'havevas', 'havevan']),
  conditional: cells(['havess', 'havesses', 'havess', 'havessen', 'havesses', 'havessen']),
  subjunctive: cells(['hagi', 'hagies', 'hagi', 'hagien', 'hagies', 'hagien']),
};

/** *vegnir* (COME): the future's auxiliary, *jeu vegnel a magliar* (P04 D7, the style sheet). */
export const VEGNIR_SURSILV: AuxTable = {
  present: cells(['vegnel', 'vegns', 'vegn', 'vegnin', 'vegnis', 'vegnan']),
  imperfect: cells(['vegnevel', 'vegnevas', 'vegneva', 'vegnevan', 'vegnevas', 'vegnevan']),
  conditional: cells(['vegniss', 'vegnisses', 'vegniss', 'vegnissen', 'vegnisses', 'vegnissen']),
  subjunctive: cells(['vegni', 'vegnies', 'vegni', 'vegnien', 'vegnies', 'vegnien']),
};

/** The infinitives of the two perfect auxiliaries, for a modal chain or a citation. */
export const ESSER = 'esser';
export const HAVER = 'haver';

/**
 * The progressive and prospective periphrases after *esser*: *ei vid magliar* (is eating), *ei sin
 * il punct da magliar* (is about to eat). Both *(verify)*: the style sheet is silent, so the
 * prospective keeps RG's frame, and the progressive is the implementer's *vid* + infinitive.
 */
export const PROGRESSIVE_FRAME = 'vid';
export const PROSPECTIVE_FRAME = 'sin il punct da';

// The adposition an adjective-definition gloss wraps its dimension noun phrase in: extent and quality
// *da* ("da grond format"), measure *a* ("a gronda temperatura").
export const SURSILV_DIM_PREP: Record<DimensionRelation, string> = { extent: 'da', quality: 'da', measure: 'a' };

// The fixed idiom a plain locative and a plain goal take on a hearth noun: *a casa* for both, "el ei a
// casa", "el va a casa" (see `locativeIdiom`, `directionIdiom`).
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'a casa' };
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'a casa' };

// The preposition of `between`, said once over a coordinated landmark (P09-E1 D2).
export const BETWEEN_PREP = 'denter';

/**
 * The coordinators (style sheet): *e* (*ed* before a vowel, `coordinate`), *ni* (or — verify *ni* vs
 * *u*), *mo* (but).
 */
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'ni',
  but: 'mo',
  that_is: 'numnadamein',
  therefore: 'perquei',
  then: 'e lu',
  however: 'denton',
};

/** *and* before a vowel (style sheet): *ed*, "il gat ed igl um". */
export const AND_BEFORE_VOWEL = 'ed';

// The correlative pair of an "and" group (P09-E26): *tant il gat sco il tgaun* (verify).
export const CORRELATIVE_PAIR: readonly [string, string] = ['tant', 'sco'];

/**
 * The subordinating conjunctions (P09-E4), each ending in *che*, which elides before a vowel
 * ("cura ch'il gat maglia", see `withChe`). The mood each governs is the translator's
 * (`SUBJUNCTIVE_CONJUNCTIONS`). Every word *(verify)*.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, { word: string }> = {
  when: { word: 'cura che' },
  while: { word: 'duront che' },
  because: { word: 'perquei che' },
  after: { word: 'suenter che' },
  before: { word: 'avon che' },
  until: { word: 'tochen che' },
  since: { word: 'dapi che' },
  though: { word: 'schegie che' },
  as: { word: 'sco' },
};

/**
 * The clause's negation (P04-E11, style sheet): ***buca***, a single particle **after** the finite
 * verb — "el maglia buca", "el ha buca magliau".
 */
export const NEGATOR = 'buca';

/** The negative adverbs that take *buca*'s place (the style sheet's *mai*, "el maglia mai"). */
export const REPLACES_NEGATOR: ReadonlySet<string> = new Set(['NEVER', 'gnanc']);

/** The negative forms that stand before *buca*: ALREADY's *aunc*, "el ha aunc buca magliau" (not yet, verify). */
export const NEGATIVE_BEFORE_NEGATOR: ReadonlySet<string> = new Set(['aunc']);

// The negator of a single constituent rather than of the clause: "el cuora buca per mor dil tgaun".
export const CONSTITUENT_NEGATOR = 'buca';

/** The focus particles (C39), before the phrase: *mo* (only), *schizun* (even), *era* (also). */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'mo' }, even: { word: 'schizun' }, also: { word: 'era' },
};

/** The cardinals (C31); *in / ina* and *dus / duas* agree. Every one *(verify)*. */
export const CARDINALS: CardinalTable = {
  1: { word: 'in', fem: 'ina' }, 2: { word: 'dus', fem: 'duas' }, 3: { word: 'treis' }, 4: { word: 'quater' },
  5: { word: 'tschun' }, 6: { word: 'sis' }, 7: { word: 'siat' }, 8: { word: 'otg' },
  9: { word: 'nov' }, 10: { word: 'diesch' }, 11: { word: 'endisch' }, 12: { word: 'dudisch' },
  24: { word: 'ventgaquater' },
};

/** The examples relation's words (P09-E33, E48): *sco* (such as), *inclusiv* (including, invariable). */
export const SURSILV_EXAMPLES: Record<'example' | 'inclusion', string> = { example: 'sco', inclusion: 'inclusiv' };

/** The tenses the aspect auxiliaries are conjugated in; `past` is the imperfect (E12 D3). */
export const AUX_TENSE: Record<Tense, 'present' | 'imperfect'> = { present: 'present', past: 'imperfect', future: 'present' };

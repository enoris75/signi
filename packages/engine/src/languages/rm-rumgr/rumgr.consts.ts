import type { CoordConjunction, Degree, DimensionRelation, MannerRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Rumantsch Grischun (P04-E7). Every word in this file is *(verify)* until the variety's review
// (P04-E19); the spellings follow `docs/features/P-planning/P04-romansh/style-rm-rumgr.md`.

/**
 * The preposition each manner relation takes: similative *sco* ("sco il vent"), means *cun*, measure
 * *a*, mode *en* ("en ina moda buna"). Only *a* contracts with the article (`prepDet`).
 */
export const RG_MANNER_PREP: Record<MannerRelation, 'sco' | 'cun' | 'a' | 'en'> = { similative: 'sco', means: 'cun', measure: 'a', mode: 'en' };

/**
 * How each temporal relation is spelled (C29). `prep` is a simple preposition that contracts with
 * the masculine article where RG contracts (*a*, *da*: "al di", "dal di"); `word` is an invariable
 * word in front of it. RG says *ago* before the phrase, as a preposition: "avant in mument" (verify).
 * The `at` row's *a* is only the fallback — a noun naming its own `temporal_prep` wins ("en quest di").
 */
export const RG_TEMPORAL: Record<TemporalRelation, { word?: string; prep?: 'a' | 'da' | 'en'; postposed?: string }> = {
  at: { prep: 'a' },
  ago: { word: 'avant' },
  until: { word: 'fin', prep: 'a' },
  after: { word: 'suenter' },
  before: { word: 'avant' },
  during: { word: 'durant' },
  between: { word: 'tranter' },
  since: { word: 'dapi' },
  within: { word: 'entaifer' },
  for: { word: 'per' },
};

/**
 * The degree adverb before the (agreed) adjective (P04 §2.1): *pli* (more), *il pli* (most, the
 * article the noun phrase's), *main* (less), *uschè* (as). Comparative and relative superlative share
 * the adverb, as in Italian; the definite article tells them apart ("il giat pli grond").
 */
export const RG_DEGREE: Record<Degree, string> = {
  positive: '', more: 'pli', most: 'pli', less: 'main', least: 'main', equally: 'uschè',
};

/** The equative before a standard: *uschè grond sco il chaun* (P04 §2.1). */
export const RG_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'uschè' };

/**
 * The word before the standard of comparison, by degree (P09-E5): *che* after the comparatives ("pli
 * grond ch'il chaun", eliding before a vowel), *sco* after the equative. Neither contracts with the
 * article.
 */
export const RG_STANDARD: Partial<Record<Degree, 'che' | 'sco'>> = { more: 'che', less: 'che', equally: 'sco' };

/** The word before the set a superlative selects from (P09-E19): *da*, "il pli grond dals animals". */
export const RG_DOMAIN = 'da';

export const VOWEL_START = /^[aeiouàèéìòùâêîôû]/i;

/**
 * The adjectives that precede the noun without qualifying it — ordinals, OTHER, SAME, NEXT, the final
 * LAST, the genuine REAL, OWN, SOLE. Their lexemes say `position: 'pre'` like the qualifying ones
 * (*grond, bun, bel*), but they do not compete for the one qualifying slot before the noun (see
 * `splitAdjectives`): "in auter grond giat".
 */
export const PRENOMINAL_DETERMINER = new Set(['FIRST', 'SECOND', 'THIRD', 'NEXT', 'OTHER', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE', 'REAL_GENUINE', 'SOLE']);

/**
 * The linking preposition of an attributive noun, by relation: feature *a* ("bartga a vela"), purpose
 * *da* ("egliers da sulegl"), material *da* ("magiel da vin"), and the `domain`'s *da*, which contracts
 * with the generic definite article ("mustga dal fritg").
 */
export const REL_PREP_RG: Record<ModifierRelation, 'a' | 'da'> = { feature: 'a', purpose: 'da', material: 'da', domain: 'da' };

/** Person/number cells of one auxiliary in each tense the engine needs from it. */
type AuxTable = Record<'present' | 'imperfect' | 'conditional' | 'subjunctive', Record<string, string>>;

const cells = (forms: readonly string[]): Record<string, string> =>
  Object.fromEntries(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'].map((pn, i) => [pn, forms[i]!]));

/**
 * *esser* (BE): the compound past's auxiliary of the verbs whose lexeme says `aux: 'be'` (P04 D5),
 * and the auxiliary of the progressive and prospective periphrases (P04 §2.2). As the Pledari Grond
 * conjugates it (`conjugation-rm-rumgr.md`).
 */
export const ESSER_RG: AuxTable = {
  present: cells(['sun', 'es', 'è', 'essan', 'essas', 'èn']),
  imperfect: cells(['era', 'eras', 'era', 'eran', 'eras', 'eran']),
  conditional: cells(['fiss', 'fissas', 'fiss', 'fissan', 'fissas', 'fissan']),
  subjunctive: cells(['saja', 'sajas', 'saja', 'sajan', 'sajas', 'sajan']),
};

/** *avair* (HAVE): the compound past's auxiliary everywhere else. */
export const AVAIR_RG: AuxTable = {
  present: cells(['hai', 'has', 'ha', 'avain', 'avais', 'han']),
  imperfect: cells(['aveva', 'avevas', 'aveva', 'avevan', 'avevas', 'avevan']),
  conditional: cells(['avess', 'avessas', 'avess', 'avessan', 'avessas', 'avessan']),
  subjunctive: cells(['haja', 'hajas', 'haja', 'hajan', 'hajas', 'hajan']),
};

/** *vegnir* (COME): the future's auxiliary, *vegn a mangiar* (P04 D7). */
export const VEGNIR_RG: AuxTable = {
  present: cells(['vegn', 'vegns', 'vegn', 'vegnin', 'vegnis', 'vegnan']),
  imperfect: cells(['vegniva', 'vegnivas', 'vegniva', 'vegnivan', 'vegnivas', 'vegnivan']),
  conditional: cells(['vegniss', 'vegnissas', 'vegniss', 'vegnissan', 'vegnissas', 'vegnissan']),
  subjunctive: cells(['vegnia', 'vegnias', 'vegnia', 'vegnian', 'vegnias', 'vegnian']),
};

/** The infinitives of the three auxiliaries, for a modal chain or a citation. */
export const ESSER = 'esser';
export const AVAIR = 'avair';

/**
 * The progressive and prospective periphrases after *esser* (P04 §2.2, E14 D1): *è vidlonder da
 * mangiar* (is eating), *è sin il punct da mangiar* (is about to eat). Both *(verify)*.
 */
export const PROGRESSIVE_FRAME = 'vidlonder da';
export const PROSPECTIVE_FRAME = 'sin il punct da';

// The adposition an adjective-definition gloss wraps its dimension noun phrase in: extent and quality
// *da* ("da grond format"), measure *a* ("a gronda temperatura").
export const RG_DIM_PREP: Record<DimensionRelation, string> = { extent: 'da', quality: 'da', measure: 'a' };

// The fixed idiom a plain locative and a plain goal take on a hearth noun: *a chasa* for both, "el è a
// chasa", "el va a chasa" (see `locativeIdiom`, `directionIdiom`).
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'a chasa' };
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'a chasa' };

// The preposition of `between`, said once over a coordinated landmark (P09-E1 D2).
export const BETWEEN_PREP = 'tranter';

/**
 * The coordinators (P04 §2.3): *e, u, ma*. P04-E15 D3 open point: RG writes *e* before a vowel too —
 * no euphonic *ed* (verify), so `coordinate` keeps *e* everywhere.
 */
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'u',
  but: 'ma',
  that_is: 'numnadamain',
  therefore: 'perquai',
  then: 'e lura',
  however: 'dentant',
};

// The correlative pair of an "and" group (P09-E26): *tant il giat sco il chaun* (verify).
export const CORRELATIVE_PAIR: readonly [string, string] = ['tant', 'sco'];

/**
 * The subordinating conjunctions (P09-E4), each ending in *che*, which elides before a vowel
 * ("cura ch'il giat mangia", see `thatClause`). The mood each governs is the translator's
 * (`SUBJUNCTIVE_CONJUNCTIONS`): *avant che* and *schebain che* take the subjunctive (verify).
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, { word: string }> = {
  when: { word: 'cura che' },
  while: { word: 'durant che' },
  because: { word: 'perquai che' },
  after: { word: 'suenter che' },
  before: { word: 'avant che' },
  until: { word: 'fin che' },
  since: { word: 'dapi che' },
  though: { word: 'schebain che' },
  as: { word: 'sco' },
};

// A reflexive verb's clitic, agreeing with the subject (P04-E4: the lexeme stores *sa tschentar*,
// *jau ma tschent*): the engine places it itself where a cell does not carry it — before the
// auxiliary of the compound past ("el s'è tschentà") and on an infinitive ("jau vi ma tschentar").
export const RG_REFLEXIVE: Record<string, string> = { '1sg': 'ma', '2sg': 'ta', '3sg': 'sa', '1pl': 'ans', '2pl': 'as', '3pl': 'sa' };

/** The clause's negation (P04-E11): *na* before the finite verb, *n'* before a vowel, *betg* after it. */
export const NEGATOR = 'na';
export const NEGATOR_POST = 'betg';

/**
 * The negative adverbs that take *betg*'s place rather than joining it (P04-E11 D1): NEVER's *mai*
 * ("el na vegn mai", P04 §2.2), and ALSO's negative *gnanc* ("el na mangia gnanc la mieur") — by
 * concept id for a negative adverb, by the word for a negative form. Verify both.
 */
export const REPLACES_BETG: ReadonlySet<string> = new Set(['NEVER', 'gnanc']);

/** The negative forms that stand before *betg*: ALREADY's *anc*, "n'ha anc betg mangià" (not yet, verify). */
export const NEGATIVE_BEFORE_BETG: ReadonlySet<string> = new Set(['anc']);

// The negator of a single constituent rather than of the clause: "el curra betg pervia dal chaun".
export const CONSTITUENT_NEGATOR = 'betg';

/** The focus particles (C39), before the phrase: *mo* (only), *schizunt* (even), *era* (also). */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'mo' }, even: { word: 'schizunt' }, also: { word: 'era' },
};

/** The cardinals (C31); *in / ina* and *dus / duas* agree. */
export const CARDINALS: CardinalTable = {
  1: { word: 'in', fem: 'ina' }, 2: { word: 'dus', fem: 'duas' }, 3: { word: 'trais' }, 4: { word: 'quatter' },
  5: { word: 'tschintg' }, 6: { word: 'sis' }, 7: { word: 'set' }, 8: { word: 'otg' },
  9: { word: 'nov' }, 10: { word: 'diesch' }, 11: { word: 'indesch' }, 12: { word: 'dudesch' },
  24: { word: 'ventgaquatter' },
};

/** The examples relation's words (P09-E33, E48): *sco* (such as), *inclusiv* (including, invariable). */
export const RG_EXAMPLES: Record<'example' | 'inclusion', string> = { example: 'sco', inclusion: 'inclusiv' };

/** The tenses the aspect auxiliaries are conjugated in; `past` is the imperfect (E12 D3). */
export const AUX_TENSE: Record<Tense, 'present' | 'imperfect'> = { present: 'present', past: 'imperfect', future: 'present' };

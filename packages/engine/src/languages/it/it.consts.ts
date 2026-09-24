import type { CoordConjunction, Degree, DimensionRelation, MannerRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// The preposition each manner relation takes in Italian: similative "come" (fuses with nothing —
// "come il vento"), means "con", measure "a" (→ alla velocità), mode "in" (→ in modo). prepDet
// handles the article fusion; "come" and "con" take the non-fusing path.
export const IT_MANNER_PREP: Record<MannerRelation, 'come' | 'con' | 'a' | 'in'> = { similative: 'come', means: 'con', measure: 'a', mode: 'in' };

/**
 * How each temporal relation is spelled in Italian (C29). `prep` is a simple preposition, so the
 * article fuses with it ("a questo tempo" → "al tempo"); `word` is an invariable word emitted in
 * front of it, which is how the two locutions are built — "fino **a**", "prima **di**". "dopo" and
 * "durante" govern the noun phrase directly and fuse with nothing, so they carry a `word` and no
 * `prep`. "fa" is neither: Italian postposes it after the whole phrase ("un momento fa"), exactly as
 * English postposes "ago", so it is a `postposed` and the phrase keeps its plain article.
 *
 * The `at` row's "a" is only the fallback — a lexeme naming its own `temporal_prep` wins ("in questo
 * giorno"), the way `place_prep` and `mannerRelation` are the noun's to choose.
 */
export const IT_TEMPORAL: Record<TemporalRelation, { word?: string; prep?: 'a' | 'di'; postposed?: string }> = {
  at: { prep: 'a' },
  ago: { postposed: 'fa' },
  until: { word: 'fino', prep: 'a' },
  after: { word: 'dopo' },
  before: { word: 'prima', prep: 'di' },
  during: { word: 'durante' },
  // The spatial BETWEEN_PREP, which the group scope lifts off each conjunct (P09-E20).
  between: { word: 'tra' },
};

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "più"/"meno" in Italian — the noun phrase's definite article is what distinguishes
// them ("un gatto più grande" = a bigger cat vs "il gatto più grande" = the biggest), so
// only the adverb is added here. Equality uses the invariant "ugualmente".
export const IT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'più', most: 'più', less: 'meno', least: 'meno', equally: 'ugualmente',
};

/**
 * The degree adverb once a standard of comparison follows (P09-E5): the equative is the circumfix
 * "tanto … quanto" ("tanto grande quanto il cane"), where a bare one stays "ugualmente grande".
 */
export const IT_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'tanto' };

/**
 * The word before the standard of comparison, by degree (P09-E5). The comparatives take "di", which
 * fuses with the standard's article ("più grande del cane") — the standard is always a noun phrase,
 * so the "che" of "più grande che bello" never arises (D4). The equative's "quanto" fuses with none.
 */
export const IT_STANDARD: Partial<Record<Degree, 'di' | 'quanto'>> = { more: 'di', less: 'di', equally: 'quanto' };

/**
 * The word before the set a superlative selects from (P09-E19): the comparative's "di", fused with
 * each conjunct's article the same way — "il più grande degli animali", "della famiglia", "di noi".
 */
export const IT_DOMAIN = 'di';

export const VOWEL_START = /^[aeiouàèéìòù]/i;

/** Words that take "lo"/"gli" (s+consonant, z, ps, gn, x, y, …). */
export const SPECIAL_START = /^(s[^aeiou]|z|ps|gn|x|y)/i;

/**
 * Concept IDs of the common short *qualifying* adjectives that idiomatically precede the noun in
 * Italian (the "BAGS"-style set: beauty, age, goodness, size). Everything else (e.g. felice, triste,
 * forte, colours) stays after the noun. Both size adjectives (grande/piccolo) precede, so they
 * behave consistently.
 *
 * Italian gives the slot to **one** of these, so membership says an adjective *may* take it, not
 * that it does: `splitAdjectives` keeps the first and demotes the rest ("il grande gatto bello",
 * never "*il grande bel gatto" — A145).
 */
// GREAT, the gloss degree word, is the same "grande" as BIG and precedes like it ("di grande
// dimensione"). HIGH ("alto") stays after the noun: it is not a BAGS adjective ("la torre alta").
export const PRENOMINAL_QUALIFYING = new Set([
  'BIG', 'GREAT', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL',
]);

/**
 * The determiner-like adjectives that precede the noun: an ordinal ("il primo padre", "la seconda
 * volta"), OTHER ("un altro gatto"), SAME ("lo stesso giorno") and the final LAST ("l'ultimo
 * giorno"). They do not qualify the noun, so they do not compete for the one qualifying slot above
 * and stand in front of it — "un altro grande topo", "il primo grande gatto".
 *
 * Their position is their sense for the last two: after the noun, "il giorno stesso" is the day
 * itself and "il giorno ultimo" is not said, where "la settimana scorsa" (LAST_PREVIOUS) and "la
 * settimana prossima" (NEXT_COMING) follow it as any adjective does (localization B66).
 */
export const PRENOMINAL_DETERMINER = new Set(['FIRST', 'SECOND', 'THIRD', 'OTHER', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE']);

/** Every adjective that can precede the noun, of either kind. */
export const PRENOMINAL = new Set([...PRENOMINAL_DETERMINER, ...PRENOMINAL_QUALIFYING]);

// The quel- counterpart of each definite article form (see `quelloForm`).
export const QUELLO_FOR_ARTICLE: Record<string, string> = {
  il: 'quel', lo: 'quello', "l'": "quell'", i: 'quei', gli: 'quegli', la: 'quella', le: 'quelle',
};

/** Italian linking preposition for an attributive noun, chosen by its relation (bare, no article). */
export const REL_PREP_IT: Record<ModifierRelation, string> = { feature: 'a', purpose: 'da', material: 'di' };

// "stare" — the progressive/prospective auxiliary ("sto andando", "sto per andare"). Past
// uses the *imperfect* ("stavo andando"): the progressive past is imperfective, so the
// passato remoto ("stetti") the engine uses elsewhere would be ungrammatical here.
export const STARE_IT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'sto', '2sg': 'stai', '3sg': 'sta', '1pl': 'stiamo', '2pl': 'state', '3pl': 'stanno' },
  past:    { '1sg': 'stavo', '2sg': 'stavi', '3sg': 'stava', '1pl': 'stavamo', '2pl': 'stavate', '3pl': 'stavano' },
  future:  { '1sg': 'starò', '2sg': 'starai', '3sg': 'starà', '1pl': 'staremo', '2pl': 'starete', '3pl': 'staranno' },
};

// "essere" — the resultative auxiliary of the unaccusatives ("sono andato"), past again
// imperfect ("ero andato").
export const ESSERE_IT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'sono', '2sg': 'sei', '3sg': 'è', '1pl': 'siamo', '2pl': 'siete', '3pl': 'sono' },
  past:    { '1sg': 'ero', '2sg': 'eri', '3sg': 'era', '1pl': 'eravamo', '2pl': 'eravate', '3pl': 'erano' },
  future:  { '1sg': 'sarò', '2sg': 'sarai', '3sg': 'sarà', '1pl': 'saremo', '2pl': 'sarete', '3pl': 'saranno' },
};

// "avere" — the resultative auxiliary everywhere else ("ho visto"), the majority case.
export const AVERE_IT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'ho', '2sg': 'hai', '3sg': 'ha', '1pl': 'abbiamo', '2pl': 'avete', '3pl': 'hanno' },
  past:    { '1sg': 'avevo', '2sg': 'avevi', '3sg': 'aveva', '1pl': 'avevamo', '2pl': 'avevate', '3pl': 'avevano' },
  future:  { '1sg': 'avrò', '2sg': 'avrai', '3sg': 'avrà', '1pl': 'avremo', '2pl': 'avrete', '3pl': 'avranno' },
};

// The aspect auxiliaries as minimal concepts, so `moodForm` can derive their conditional
// (apodosis) and imperfect-subjunctive (protasis) exactly as it does a plain verb — from the
// future stem (starò → starebbe) and the infinitive/irregular stem (stare → stesse via
// IT_SUBJ_STEM, essere → fosse via BE, avere → avesse). Without this a marked aspect under a
// hypothetical dropped the mood and kept the plain present indicative.
export const STARE_AUX: ConceptForms = { conceptId: 'STARE', forms: { '1sg_future': 'starò', base: 'stare' } };

export const ESSERE_AUX: ConceptForms = { conceptId: 'BE', forms: { '1sg_future': 'sarò', base: 'essere' } };

export const AVERE_AUX: ConceptForms = { conceptId: 'AVERE', forms: { '1sg_future': 'avrò', base: 'avere' } };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "di" (**di** grande dimensione, **di** alta qualità), measure "a" (**ad** alta temperatura). The
// noun phrase (dimension noun + degree adjective) follows bare, its adjective already agreed/placed.
export const IT_DIM_PREP: Record<DimensionRelation, string> = { extent: 'di', quality: 'di', measure: 'a' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// Italian says "a casa" (or "in casa"), not "nella casa".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'a casa' };

// The preposition of `between`, said once over a coordinated landmark rather than on each conjunct
// (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`): `spatialHead` builds each conjunct with it as it
// builds any relation, and the complement lifts it off every conjunct to say it in front of all.
export const BETWEEN_PREP = 'tra';

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'o',
  but: 'ma',
  that_is: 'cioè',
  therefore: 'quindi',
  then: 'e poi',
};

/**
 * The subordinating conjunctions (see PhrasePlan.adverbialClause, P09-E4). "Prima che" governs the
 * subjunctive, which the translator resolves the clause in; the others take the indicative.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'quando', while: 'mentre', because: 'perché', after: 'dopo che', before: 'prima che',
};

/**
 * Adjectives invariable in gender and number, by base. A number used as an adjective is one ("la frase zero, gli articoli zero");
 * so is a prepositional phrase standing for one ("la frase senza titolo", "le frasi senza titolo"). The agreement
 * rule would otherwise inflect either like any adjective with its ending ("*senza titola").
 */
export const INVARIABLE_ADJ: ReadonlySet<string> = new Set(['zero', 'senza titolo', 'bene']);

/**
 * The "-ico" adjectives of three or more syllables that keep the hard "-chi" in the masculine plural,
 * because they are stressed on the second-to-last syllable: antìco → antichi, càrico → carichi.
 */
export const HARD_ICO_ADJ: ReadonlySet<string> = new Set(['antico', 'carico']);

/**
 * Verbs whose tu command is a monosyllable (da', fa', va') that doubles an enclitic's consonant:
 * "dallo", "fammi", "vacci". Keyed by concept, not by the apostrophe.
 */
export const IT_SHORT_IMPERATIVE: ReadonlySet<string> = new Set(['GIVE', 'MAKE', 'GO']);

/**
 * The prepositions a personal pronoun follows through "di": "su di me", "sotto di lui", "senza di
 * te", "attraverso di lui" (A139, and A203 for the complements' spatial locutions). The others take
 * the tonic pronoun directly ("a me", "con lui", "in lui", "da lui", "come lui"), and so do the
 * locutions that already govern a "di" or an "a" of their own ("intorno a lui", "davanti a lui").
 */
export const IT_DI_BEFORE_PRONOUN: ReadonlySet<string> = new Set(['su', 'sopra', 'sotto', 'dietro', 'dentro', 'verso', 'contro', 'senza', 'attraverso']);

// A pronominal verb's clitic, agreeing with the subject (mi/ti/si/ci/vi/si). Pronominality is lexical:
// the infinitive ends in the enclitic -rsi ("muoversi"), and each stored finite form carries the clitic
// as a proclitic word ("si muove"), as the Spanish lexicon stores "se vuelve".
export const IT_REFLEXIVE: Record<string, string> = { '1sg': 'mi', '2sg': 'ti', '3sg': 'si', '1pl': 'ci', '2pl': 'vi', '3pl': 'si' };

// Il negatore di un singolo costituente, non della frase: "corre **non** a causa del cane" — corre,
// e il cane non ne è la ragione (vedi `Complement.negative`).
export const CONSTITUENT_NEGATOR = 'non';

/** The focus particles (see NounPhrase.focus, C39). Italian writes all three before the phrase. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'solo' }, even: { word: 'perfino' }, also: { word: 'anche' },
};

/** The cardinals Italian spells (see `numeralWord`, C31); only "uno" agrees. */
export const CARDINALS: CardinalTable = {
  1: { word: 'un', fem: 'una' }, 2: { word: 'due' }, 3: { word: 'tre' }, 4: { word: 'quattro' },
  5: { word: 'cinque' }, 6: { word: 'sei' }, 7: { word: 'sette' }, 8: { word: 'otto' },
  9: { word: 'nove' }, 10: { word: 'dieci' }, 11: { word: 'undici' }, 12: { word: 'dodici' },
  24: { word: 'ventiquattro' },
};

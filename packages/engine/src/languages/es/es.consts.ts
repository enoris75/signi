import type { CoordConjunction, Degree, DimensionRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "más"/"menos"; the noun phrase's definite article distinguishes them ("un gato más
// grande" vs "el gato más grande"). Equality uses the invariant "igual de".
export const ES_DEGREE: Record<Degree, string> = {
  positive: '', more: 'más', most: 'más', less: 'menos', least: 'menos', equally: 'igual de',
};

/**
 * The degree adverb once a standard of comparison follows (P09-E5): the equative is the circumfix
 * "tan … como" ("tan grande como el perro"), where a bare one stays "igual de grande".
 */
export const ES_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'tan' };

/** The word before the standard of comparison, by degree: "más grande que el perro", "tan grande como el perro" (P09-E5). */
export const ES_STANDARD: Partial<Record<Degree, string>> = { more: 'que', less: 'que', equally: 'como' };

/**
 * The word before the set a superlative selects from (P09-E19): the preposition "de", contracting
 * with each conjunct's "el" ("el más grande de los animales", "del grupo") and governing a pronoun's
 * tonic form ("de nosotros"), unlike the comparative's conjunction "que".
 */
export const ES_DOMAIN = 'de';

/**
 * The word before the standard under an equative intensifier: VERY keeps *igual de* before a
 * standard ("igual de grande que el perro"), and *igual de* takes "que", not the circumfix's "como"
 * (see `applyIntensifier`, A255).
 */
export const ES_EQUATIVE_INTENSIFIER_STANDARD = 'que';

/**
 * Concept IDs of the adjectives that precede their noun in Spanish. The ordinals and OTHER are
 * here because that is simply where they go: "el primer día", "la segunda vez", "el otro gato".
 * NEW is here for a different reason — its position decides its sense. After the noun "nuevo" is
 * *recently made* ("una casa nueva" is a newly built house); before it, *another, one more* ("una
 * nueva casa" is a second house, however old). Every NEW the app composes means the second one,
 * so NEW precedes (A204). Every other qualifying adjective (grande, feliz, rojo …) follows the
 * noun, which is why Spanish needs no "BAGS" set the way French and Italian do.
 *
 * SAME and the final LAST precede for the same reason (localization B66): "el mismo día", "el último
 * día", where "el día mismo" is the day itself. LAST_PREVIOUS and NEXT_COMING follow ("la semana
 * pasada", "la semana próxima"). Neither apocopates: "el último día", never "*el últim día".
 *
 * So does the genuine REAL (localization B87): "un verdadero problema"; after the noun it is "true"
 * ("una historia verdadera").
 */
export const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD', 'OTHER', 'NEW', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE', 'REAL_GENUINE']);

/**
 * The adpositions that govern the NOMINATIVE pronoun rather than the tonic one. The similative
 * "como" is an abbreviated comparison — "corre como yo" stands for "como yo corro" — so the pronoun
 * is the subject of the clause it shortens, not the object of a preposition: "como mí" is not
 * Spanish. German's "wie" is the same word and takes the nominative for the same reason (A203).
 * Spanish has a wider class of these — "según", "entre", "excepto", "salvo", "menos" — and a
 * complement head emits two of them: "como", and `between`'s "entre" (P09-E1), "entre tú y yo",
 * never "entre ti y mí".
 */
export const NOMINATIVE_PREP: ReadonlySet<string> = new Set(['como', 'entre']);

// "estar" — the auxiliary of the progressive and prospective: estar + gerundio / "a punto de"
// + infinitivo. Past uses the imperfect ("estaba"), the aspectually-imperfective past.
export const ESTAR_ES: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'estoy', '2sg': 'estás', '3sg': 'está', '1pl': 'estamos', '2pl': 'estáis', '3pl': 'están' },
  past:    { '1sg': 'estaba', '2sg': 'estabas', '3sg': 'estaba', '1pl': 'estábamos', '2pl': 'estabais', '3pl': 'estaban' },
  future:  { '1sg': 'estaré', '2sg': 'estarás', '3sg': 'estará', '1pl': 'estaremos', '2pl': 'estaréis', '3pl': 'estarán' },
};

// "haber" — the resultative auxiliary. Spanish has no essere/avere split: every verb takes
// haber, and the participle never agrees with the subject ("ella ha ido", not "ha ida").
export const HABER_ES: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'he', '2sg': 'has', '3sg': 'ha', '1pl': 'hemos', '2pl': 'habéis', '3pl': 'han' },
  past:    { '1sg': 'había', '2sg': 'habías', '3sg': 'había', '1pl': 'habíamos', '2pl': 'habíais', '3pl': 'habían' },
  future:  { '1sg': 'habré', '2sg': 'habrás', '3sg': 'habrá', '1pl': 'habremos', '2pl': 'habréis', '3pl': 'habrán' },
};

// The aspect auxiliaries as minimal concepts, so `moodForm` derives their conditional (estaría /
// habría, from the future stem) and imperfect subjunctive (estuviera / hubiera, from the 3pl
// preterite) — the same way it handles a plain verb. The preterite stems are irregular and are
// not in the tables above (which carry the imperfect), so they are supplied here. Without this a
// marked aspect under a hypothetical dropped the mood and kept the plain present indicative.
export const ESTAR_AUX: ConceptForms = { conceptId: 'ESTAR', forms: { '1sg_future': 'estaré', '3pl_past': 'estuvieron' } };

export const HABER_AUX: ConceptForms = { conceptId: 'HABER', forms: { '1sg_future': 'habré', '3pl_past': 'hubieron' } };

// A47: the *copular* "estar" — the finite copula a located subject takes ("el gato está en la
// casa"), distinct from the aspect auxiliary above (which carries the imperfect past "estaba").
// Shaped exactly like the seeded BE (ser) paradigm so `conjugate` and `moodForm` inflect it the
// same way: the past is the preterite ("estuvo"), consistent with the C6 simple-past-as-perfective
// mapping, and the future stem drives the conditional (estaría), the 3pl preterite the subjunctive
// (estuviera). Person/tense keys mirror ser's so the swap in `predicateText` is a drop-in.
export const ESTAR_COPULA: ConceptForms = {
  conceptId: 'ESTAR',
  forms: {
    // A state, like the copula it stands in for: its past is the imperfect (A130).
    base: 'estar', participle: 'estado', gerund: 'estando', stative: '1',
    '1sg_present': 'estoy', '2sg_present': 'estás', '3sg_present': 'está',
    '1pl_present': 'estamos', '2pl_present': 'estáis', '3pl_present': 'están',
    '1sg_past': 'estuve', '2sg_past': 'estuviste', '3sg_past': 'estuvo',
    '1pl_past': 'estuvimos', '2pl_past': 'estuvisteis', '3pl_past': 'estuvieron',
    '1sg_future': 'estaré', '2sg_future': 'estarás', '3sg_future': 'estará',
    '1pl_future': 'estaremos', '2pl_future': 'estaréis', '3pl_future': 'estarán',
  },
};

// The existential "haber" (P09-E6 D5): "hay un gato", conjugated in place of the HAVE (tener) an
// existential is resolved with, since the corpus seeds no haber as a lexical verb. Impersonal, so only
// the third singular is ever read, and the present is the defective "hay", not the auxiliary's "ha".
// Shaped like ESTAR_COPULA: a state, so its past is the imperfect "había" (A130); the future stem
// gives the conditional "habría" and the 3pl preterite the imperfect subjunctive "hubiera"; the
// present subjunctive "haya" is HABER's in `mood.ts`.
export const HABER_EXISTENTIAL: ConceptForms = {
  conceptId: 'HABER',
  forms: {
    base: 'haber', participle: 'habido', gerund: 'habiendo', stative: '1',
    '3sg_present': 'hay', '3sg_past': 'hubo', '3sg_future': 'habrá',
    '1sg_future': 'habré', '3pl_past': 'hubieron',
  },
};

// A reflexive verb's clitic, agreeing with the subject (me/te/se/nos/os/se). Reflexivity is lexical:
// the infinitive ends in the enclitic -se ("volverse"), and the finite present carries the clitic as
// a proclitic word ("se vuelve"). The participle ("vuelto") drops it, so the compound perfect must
// restore it before the auxiliary — "se ha vuelto" (become), not "ha vuelto" (returned).
export const ES_REFLEXIVE: Record<string, string> = { '1sg': 'me', '2sg': 'te', '3sg': 'se', '1pl': 'nos', '2pl': 'os', '3pl': 'se' };

/** Spanish links every attributive-noun relation with bare "de" ("barco de vela", "gafas de sol"). */
export const REL_PREP_ES: Record<ModifierRelation, string> = { feature: 'de', purpose: 'de', material: 'de' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "de" (**de** gran tamaño, **de** alta calidad), measure "a". The noun phrase (dimension noun +
// degree adjective) follows bare, its adjective already agreed and placed by the ordinary NP path.
export const ES_DIM_PREP: Record<DimensionRelation, string> = { extent: 'de', quality: 'de', measure: 'a' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// Spanish says a bare "en casa", not "en el hogar" — the hearth-word gives way to "casa".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'en casa' };

// The same noun's idiom as a plain goal (see `directionIdiom`, P09-E37): "va a casa", not "va al
// hogar" — the goal's "a" where the place took "en".
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'a casa' };

// The preposition of `between`, said once over a coordinated landmark rather than on each conjunct
// (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`): `spatialHead` builds each conjunct with it as it
// builds any relation, and the complement lifts it off every conjunct to say it in front of all.
export const BETWEEN_PREP = 'entre';

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'y',
  or: 'o',
  but: 'pero',
  that_is: 'es decir',
  // "entonces" is both conclusive and temporal in Spanish; the unambiguous "por lo tanto" /
  // "y luego" pair keeps the two selectors distinguishable.
  therefore: 'por lo tanto',
  then: 'y luego',
  however: 'sin embargo',
};

/**
 * The subordinating conjunctions (see PhrasePlan.adverbialClause, P09-E4). "Antes de que" governs the
 * subjunctive, which the translator resolves the clause in; the others take the indicative.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'cuando', while: 'mientras', because: 'porque', after: 'después de que', before: 'antes de que',
  // P09-E27: "hasta que" governs the subjunctive; "aunque" asserts its clause here (the factual
  // reading "though the dog eats") and keeps the indicative, as "desde que" does.
  until: 'hasta que', since: 'desde que', though: 'aunque',
  // Localization C41: the similative, on the indicative ("como el perro corre", "como se espera").
  as: 'como',
};

/**
 * The discourse connectors (conectores) among the clause conjunctions, set off by a comma after them
 * as well as before (RAE, Ortografía 2010, §3.4.2.2.1.1): "el gato corre, es decir, el perro salta",
 * "…, por lo tanto, …". The true conjunctions (y, o, pero, y luego) take none.
 */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is', 'however', 'therefore']);

/**
 * Adjectives invariable in gender and number, by base. A number used as an adjective is one ("la frase cero, los artículos cero");
 * so is a prepositional phrase standing for one ("la frase sin título"). The agreement rule would otherwise inflect
 * either like any adjective with its ending ("*sin títula").
 */
export const INVARIABLE_ADJ: ReadonlySet<string> = new Set(['cero', 'sin título', 'bien']);

/**
 * "con" fuses with the 1st and 2nd singular tonic pronouns, and with the reflexive: con + mí →
 * conmigo, con + ti → contigo, con + sí → consigo. Every other person keeps the two words ("con él",
 * "con nosotros"). The reflexive is listed for completeness; nothing builds a reflexive comitative
 * today. Keyed by the tonic form, which is what the complement builder has in hand (A197).
 */
export const COMITATIVE_FUSION: Record<string, string> = { 'mí': 'conmigo', ti: 'contigo', 'sí': 'consigo' };

// El negador de un solo constituyente, no de la oración: "corre **no** a causa del perro" — corre, y
// el perro no es la razón (véase `Complement.negative`).
export const CONSTITUENT_NEGATOR = 'no';

/** The focus particles (see NounPhrase.focus, C39). Spanish writes all three before the phrase. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'solo' }, even: { word: 'incluso' }, also: { word: 'también' },
};

/** The cardinals Spanish spells (see `numeralWord`, C31); only "uno" agrees. */
export const CARDINALS: CardinalTable = {
  1: { word: 'un', fem: 'una' }, 2: { word: 'dos' }, 3: { word: 'tres' }, 4: { word: 'cuatro' },
  5: { word: 'cinco' }, 6: { word: 'seis' }, 7: { word: 'siete' }, 8: { word: 'ocho' },
  9: { word: 'nueve' }, 10: { word: 'diez' }, 11: { word: 'once' }, 12: { word: 'doce' },
  24: { word: 'veinticuatro' },
};

/**
 * How each temporal relation is spelled in Spanish (C29). `de: true` marks the two locutions that
 * end in "de" and so fuse with a masculine singular definite through it ("después del día"); the
 * others govern the phrase directly. `at` is not here: it reads the head noun's own `temporal_prep`
 * and falls back on "en", the word Spanish already puts before a day, a month and a moment. A lexeme
 * that names one goes through the non-contracting `prepDet`, which is right for every word but "a"
 * and "de" — the two Spanish fuses with "el". None names either today; one that needs to must route
 * through `aDet` / `deDet` instead, or it will render "a el día".
 *
 * "hace" is an impersonal verb, not a preposition — "hace un momento" is literally "it makes a
 * moment" — but it stands in exactly the place a preposition would and takes the phrase's own
 * article, so it needs nothing special beyond its row.
 */
export const ES_TEMPORAL: Record<Exclude<TemporalRelation, 'at'>, { word: string; de?: boolean }> = {
  ago: { word: 'hace' },
  until: { word: 'hasta' },
  after: { word: 'después', de: true },
  before: { word: 'antes', de: true },
  during: { word: 'durante' },
  // The spatial BETWEEN_PREP, which the group scope lifts off each conjunct (P09-E20).
  between: { word: 'entre' },
  since: { word: 'desde' },
  // P09-E34: a locution ending in "de", fused through it like "después de" ("dentro del día").
  within: { word: 'dentro', de: true },
  // P09-E35: the duration is "durante", as `during` is — Spanish does not tell the two apart.
  for: { word: 'durante' },
};

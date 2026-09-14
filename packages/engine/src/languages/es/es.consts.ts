import type { CoordConjunction, Degree, DimensionRelation, ModifierRelation, Tense } from '@signi/shared';
import type { ConceptForms } from '../../types.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "más"/"menos"; the noun phrase's definite article distinguishes them ("un gato más
// grande" vs "el gato más grande"). Equality uses the invariant "igual de".
export const ES_DEGREE: Record<Degree, string> = {
  positive: '', more: 'más', most: 'más', less: 'menos', least: 'menos', equally: 'igual de',
};

/**
 * Concept IDs of the adjectives that precede their noun in Spanish. Only the ordinals and OTHER
 * do: "el primer día", "la segunda vez", "el otro gato". Every qualifying adjective (grande,
 * feliz, rojo …) follows the noun, which is why Spanish needs no "BAGS" set the way French and
 * Italian do.
 */
export const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD', 'OTHER']);

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

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'y',
  or: 'o',
  but: 'pero',
  that_is: 'es decir',
  // "entonces" is both conclusive and temporal in Spanish; the unambiguous "por lo tanto" /
  // "y luego" pair keeps the two selectors distinguishable.
  therefore: 'por lo tanto',
  then: 'y luego',
};

/**
 * The discourse connectors (conectores) among the clause conjunctions, set off by a comma after them
 * as well as before (RAE, Ortografía 2010, §3.4.2.2.1.1): "el gato corre, es decir, el perro salta",
 * "…, por lo tanto, …". The true conjunctions (y, o, pero, y luego) take none.
 */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is', 'therefore']);

/**
 * Adjectives invariable in gender and number, by base. A number used as an adjective is one ("la frase cero, los artículos cero");
 * so is a prepositional phrase standing for one ("la frase sin título"). The agreement rule would otherwise inflect
 * either like any adjective with its ending ("*sin títula").
 */
export const INVARIABLE_ADJ: ReadonlySet<string> = new Set(['cero', 'sin título']);

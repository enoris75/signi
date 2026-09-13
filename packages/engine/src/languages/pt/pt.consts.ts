import type { CoordConjunction, Degree, DimensionRelation, ModifierRelation, Tense } from '@signi/shared';
import type { ConceptForms } from '../../types.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "mais"/"menos"; the noun phrase's definite article distinguishes them ("um gato mais
// grande" vs "o gato mais grande"). Equality uses the invariant "igualmente".
export const PT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'mais', most: 'mais', less: 'menos', least: 'menos', equally: 'igualmente',
};

/**
 * The raised degrees (more/most) of these adjectives are suppletive in Portuguese — a single
 * synthetic word, never "mais" + base: grande → maior, bom → melhor, pequeno → menor, mau →
 * pior. Only "more"/"most" suppletise; the lowered and equal degrees stay periphrastic ("menos
 * grande", "igualmente bom"). All four suppletives are gender-invariant and pluralise in -es
 * (maiores, melhores), which `agreeAdj` derives from the base.
 */
export const PT_SUPPLETIVE: Record<string, string> = {
  BIG: 'maior', GOOD: 'melhor', SMALL: 'menor', BAD: 'pior',
};

/** Irregular Portuguese adjectives: base → [masc sg, fem sg, masc pl, fem pl]. */
export const IRREGULAR_ADJ: Record<string, [string, string, string, string]> = {
  bom: ['bom', 'boa', 'bons', 'boas'],
  mau: ['mau', 'má', 'maus', 'más'],
};

/**
 * Concept IDs of the adjectives that precede their noun in Portuguese. Only the ordinals do:
 * "o primeiro dia", "a segunda vez". Every qualifying adjective follows the noun (and unlike
 * Spanish, no ordinal apocopates — "o primeiro dia", never "*o primer dia").
 */
export const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD']);

// "estar" — the auxiliary of the progressive and prospective: estar + gerúndio / "prestes a" +
// infinitivo. Past uses the imperfect ("estava"). The gerund progressive is the Brazilian norm
// ("está indo").
export const ESTAR_PT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'estou', '2sg': 'estás', '3sg': 'está', '1pl': 'estamos', '2pl': 'estais', '3pl': 'estão' },
  past:    { '1sg': 'estava', '2sg': 'estavas', '3sg': 'estava', '1pl': 'estávamos', '2pl': 'estáveis', '3pl': 'estavam' },
  future:  { '1sg': 'estarei', '2sg': 'estarás', '3sg': 'estará', '1pl': 'estaremos', '2pl': 'estareis', '3pl': 'estarão' },
};

// "ter" — the resultative auxiliary. Like Spanish, Portuguese has no essere/avere split (and
// unlike Spanish it uses "ter", not "haver"); the participle does not agree with the subject.
export const TER_PT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'tenho', '2sg': 'tens', '3sg': 'tem', '1pl': 'temos', '2pl': 'tendes', '3pl': 'têm' },
  past:    { '1sg': 'tinha', '2sg': 'tinhas', '3sg': 'tinha', '1pl': 'tínhamos', '2pl': 'tínheis', '3pl': 'tinham' },
  future:  { '1sg': 'terei', '2sg': 'terás', '3sg': 'terá', '1pl': 'teremos', '2pl': 'tereis', '3pl': 'terão' },
};

// The aspect auxiliaries as minimal concepts, so `moodForm` derives their conditional (estaria /
// teria, from the future stem) and imperfect subjunctive (estivesse / tivesse, from the 3pl
// preterite) — the same way it handles a plain verb. The preterite stems are irregular and are
// not in the tables above (which carry the imperfect), so they are supplied here.
export const ESTAR_AUX: ConceptForms = { conceptId: 'ESTAR', forms: { '1sg_future': 'estarei', '3pl_past': 'estiveram' } };

export const TER_AUX: ConceptForms = { conceptId: 'TER', forms: { '1sg_future': 'terei', '3pl_past': 'tiveram' } };

// A47: the *copular* "estar" — the finite copula a located subject takes ("o gato está na casa"),
// distinct from the aspect auxiliary above (which carries the imperfect past "estava"). Shaped like
// the seeded BE (ser) paradigm so `conjugate` and `moodForm` inflect it the same way: the past is
// the pretérito ("esteve"), consistent with the C6 simple-past-as-perfective mapping, and the future
// stem drives the conditional (estaria), the 3pl preterite the subjunctive (estivesse).
export const ESTAR_COPULA: ConceptForms = {
  conceptId: 'ESTAR',
  forms: {
    base: 'estar',
    '1sg_present': 'estou', '2sg_present': 'estás', '3sg_present': 'está',
    '1pl_present': 'estamos', '2pl_present': 'estais', '3pl_present': 'estão',
    '1sg_past': 'estive', '2sg_past': 'estiveste', '3sg_past': 'esteve',
    '1pl_past': 'estivemos', '2pl_past': 'estivestes', '3pl_past': 'estiveram',
    '1sg_future': 'estarei', '2sg_future': 'estarás', '3sg_future': 'estará',
    '1pl_future': 'estaremos', '2pl_future': 'estareis', '3pl_future': 'estarão',
  },
};

/** Portuguese linking preposition for an attributive noun, by relation (bare, no article). */
export const REL_PREP_PT: Record<ModifierRelation, string> = { feature: 'a', purpose: 'de', material: 'de' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "de" (**de** grande tamanho, **de** alta qualidade), measure "a". The noun phrase (dimension noun
// + degree adjective) follows bare, its adjective already agreed and placed by the ordinary NP path.
export const PT_DIM_PREP: Record<DimensionRelation, string> = { extent: 'de', quality: 'de', measure: 'a' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// Portuguese says a bare "em casa", not "no lar" — the hearth-word gives way to "casa".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'em casa' };

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'ou',
  but: 'mas',
  that_is: 'isto é',
  // As in Spanish, "então" spans both senses; "portanto" / "e depois" separate them.
  therefore: 'portanto',
  then: 'e depois',
};

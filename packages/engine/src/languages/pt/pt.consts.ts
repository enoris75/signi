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
 * (maiores, melhores), which `agreeAdj` derives from the base. The table is keyed by the Portuguese
 * base, not the concept, so every concept spelled so suppletises (BIG and GREAT are both "grande").
 */
export const PT_SUPPLETIVE: Record<string, string> = {
  grande: 'maior', bom: 'melhor', pequeno: 'menor', mau: 'pior',
};

/** The tonic pronouns "de" fuses with: de + ele → dele, de + isso → disso, de + aquilo → daquilo. */
export const PT_DE_FUSING_PRONOUN = /^(?:el[ae]s?|isso|isto|aquilo|aquel[ae]s?)$/i;

/** Irregular Portuguese adjectives: base → [masc sg, fem sg, masc pl, fem pl]. */
export const IRREGULAR_ADJ: Record<string, [string, string, string, string]> = {
  bom: ['bom', 'boa', 'bons', 'boas'],
  mau: ['mau', 'má', 'maus', 'más'],
};

/**
 * Concept IDs of the adjectives that precede their noun in Portuguese. Only the ordinals and
 * OTHER do: "o primeiro dia", "a segunda vez", "o outro gato". Every qualifying adjective follows
 * the noun (and unlike
 * Spanish, no ordinal apocopates — "o primeiro dia", never "*o primer dia").
 */
export const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD', 'OTHER']);

// "estar" — the auxiliary of the progressive and prospective: estar + gerúndio / "prestes a" +
// infinitivo. Past uses the imperfect ("estava"). The gerund progressive is the Brazilian norm
// ("está indo"). The 2nd person is você / vocês, agreeing as the 3rd, in this and the tables below.
export const ESTAR_PT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'estou', '2sg': 'está', '3sg': 'está', '1pl': 'estamos', '2pl': 'estão', '3pl': 'estão' },
  past:    { '1sg': 'estava', '2sg': 'estava', '3sg': 'estava', '1pl': 'estávamos', '2pl': 'estavam', '3pl': 'estavam' },
  future:  { '1sg': 'estarei', '2sg': 'estará', '3sg': 'estará', '1pl': 'estaremos', '2pl': 'estarão', '3pl': 'estarão' },
};

// "ter" — the resultative auxiliary. Like Spanish, Portuguese has no essere/avere split (and
// unlike Spanish it uses "ter", not "haver"); the participle does not agree with the subject.
export const TER_PT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'tenho', '2sg': 'tem', '3sg': 'tem', '1pl': 'temos', '2pl': 'têm', '3pl': 'têm' },
  past:    { '1sg': 'tinha', '2sg': 'tinha', '3sg': 'tinha', '1pl': 'tínhamos', '2pl': 'tinham', '3pl': 'tinham' },
  future:  { '1sg': 'terei', '2sg': 'terá', '3sg': 'terá', '1pl': 'teremos', '2pl': 'terão', '3pl': 'terão' },
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
    // A state, like the copula it stands in for: its past is the imperfect (A130).
    base: 'estar', participle: 'estado', gerund: 'estando', stative: '1',
    '1sg_present': 'estou', '2sg_present': 'está', '3sg_present': 'está',
    '1pl_present': 'estamos', '2pl_present': 'estão', '3pl_present': 'estão',
    '1sg_past': 'estive', '2sg_past': 'esteve', '3sg_past': 'esteve',
    '1pl_past': 'estivemos', '2pl_past': 'estiveram', '3pl_past': 'estiveram',
    '1sg_future': 'estarei', '2sg_future': 'estará', '3sg_future': 'estará',
    '1pl_future': 'estaremos', '2pl_future': 'estarão', '3pl_future': 'estarão',
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

/**
 * The explanatory connectors among the clause conjunctions, set off by a comma after them as well as
 * before: "o gato corre, isto é, o cão pula". "portanto" heading its clause may go without one.
 */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is']);

/**
 * Adjectives invariable in gender and number, by base. A number used as an adjective is one ("a casa zero, os gatos zero");
 * the agreement rule would otherwise inflect it like any adjective with its ending.
 */
export const INVARIABLE_ADJ: ReadonlySet<string> = new Set(['zero']);

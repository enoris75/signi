import type { CoordConjunction, Degree, DimensionRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "mais"/"menos"; the noun phrase's definite article distinguishes them ("um gato mais
// grande" vs "o gato mais grande"). Equality uses the invariant "igualmente".
export const PT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'mais', most: 'mais', less: 'menos', least: 'menos', equally: 'igualmente',
};

/**
 * The degree adverb once a standard of comparison follows (P09-E5): the equative is the circumfix
 * "tão … como" ("tão grande como o cão"), where a bare one stays "igualmente grande".
 */
export const PT_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'tão' };

/**
 * The word before the standard of comparison, by degree (P09-E5): the fixed "do que" for the
 * comparatives — "maior do que o cão", its "do" never agreeing with the standard, which keeps its own
 * article ("do que a gata") — and "como" for the equative. The bare "que" is a variant, not needed (D4).
 */
export const PT_STANDARD: Partial<Record<Degree, string>> = { more: 'do que', less: 'do que', equally: 'como' };

/**
 * The word before the set a superlative selects from (P09-E19): the preposition "de", contracting
 * with each conjunct's article ("o maior dos animais", "da família") and governing a pronoun's tonic
 * form ("de nós", "dele"), unlike the comparative's fixed "do que".
 */
export const PT_DOMAIN = 'de';

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

/**
 * The tonic pronouns "de" and "em" fuse with: de + ele → dele, de + isso → disso, de + aquilo → daquilo;
 * em + ele → nele, em + isso → nisso.
 */
export const PT_DE_FUSING_PRONOUN = /^(?:el[ae]s?|isso|isto|aquilo|aquel[ae]s?)$/i;

/**
 * "com" fuses with three of the tonic pronouns: com + mim → comigo, com + ti → contigo, com + nós →
 * conosco (the Brazilian spelling; "connosco" is the European one). Every other person keeps the two
 * words ("com ele", "com você", "com vocês"), and "com si" → consigo is listed for completeness,
 * since nothing builds a reflexive comitative today. Keyed by the tonic form, which is what the
 * complement builder has in hand (A197).
 */
export const COMITATIVE_FUSION: Record<string, string> = { mim: 'comigo', ti: 'contigo', 'nós': 'conosco', si: 'consigo' };

/** Irregular Portuguese adjectives: base → [masc sg, fem sg, masc pl, fem pl]. */
export const IRREGULAR_ADJ: Record<string, [string, string, string, string]> = {
  bom: ['bom', 'boa', 'bons', 'boas'],
  mau: ['mau', 'má', 'maus', 'más'],
};

/**
 * Concept IDs of the adjectives that precede their noun in Portuguese. The ordinals and OTHER are
 * here because that is simply where they go: "o primeiro dia", "a segunda vez", "o outro gato".
 * NEW is here for a different reason — its position decides its sense. After the noun "novo" is
 * *recently made* ("uma casa nova" is a newly built house); before it, *another, one more* ("uma
 * nova casa" is a second house, however old). Every NEW the app composes means the second one, so
 * NEW precedes (A204). Every other qualifying adjective follows the noun (and unlike Spanish, no
 * ordinal apocopates — "o primeiro dia", never "*o primer dia").
 *
 * SAME and the final LAST precede for the same reason (localization B66): "o mesmo dia", "o último
 * dia", where "o dia mesmo" is the day itself. LAST_PREVIOUS and NEXT_COMING follow ("a semana
 * passada", "a semana próxima").
 */
export const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD', 'OTHER', 'NEW', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE']);

/**
 * The adpositions that govern the NOMINATIVE pronoun rather than the tonic one. The similative
 * "como" is an abbreviated comparison — "corre como eu" stands for "como eu corro" — so the pronoun
 * is the subject of the clause it shortens, not the object of a preposition: "como mim" is not
 * Portuguese. German's "wie" is the same word and takes the nominative for the same reason (A203).
 * The tonic "mim"/"ti" belongs after a true preposition ("por mim", "debaixo de ti"), which is
 * where the rest of the complements put it.
 */
export const NOMINATIVE_PREP: ReadonlySet<string> = new Set(['como']);

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

// The existential "haver" (P09-E6 D5): "há um gato", conjugated in place of the HAVE (ter) an
// existential is resolved with, since the corpus seeds no haver. Impersonal, so only the third
// singular is ever read. Shaped like the seeded paradigms for `conjugate` and `moodForm`: a state, so
// its past is the imperfect "havia" (A130); the future stem gives the conditional "haveria", the 3pl
// preterite the subjunctives "houvesse" / "houver"; the present subjunctive "haja" is in `mood.ts`.
export const HAVER_EXISTENTIAL: ConceptForms = {
  conceptId: 'HAVER',
  forms: {
    base: 'haver', participle: 'havido', gerund: 'havendo', stative: '1',
    '3sg_present': 'há', '3sg_past': 'houve', '3sg_future': 'haverá',
    '1sg_future': 'haverei', '3pl_past': 'houveram',
  },
};

// A pronominal verb's clitic, agreeing with the subject: "me" and "nos", and "se" for the rest — você and
// vocês agree as the 3rd person (A108). Reflexivity is lexical: the infinitive ends in "-se" ("tornar-se").
export const PT_REFLEXIVE: Record<string, string> = { '1sg': 'me', '2sg': 'se', '3sg': 'se', '1pl': 'nos', '2pl': 'se', '3pl': 'se' };

/** Portuguese linking preposition for an attributive noun, by relation (bare, no article). */
export const REL_PREP_PT: Record<ModifierRelation, string> = { feature: 'a', purpose: 'de', material: 'de' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "de" (**de** grande tamanho, **de** alta qualidade), measure "a". The noun phrase (dimension noun
// + degree adjective) follows bare, its adjective already agreed and placed by the ordinary NP path.
export const PT_DIM_PREP: Record<DimensionRelation, string> = { extent: 'de', quality: 'de', measure: 'a' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// Portuguese says a bare "em casa", not "no lar" — the hearth-word gives way to "casa".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'em casa' };

// The same noun's idiom as a plain goal (see `directionIdiom`, P09-E37): "vai para casa", not "vai
// ao lar" — the goal's "para" where the place took "em".
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'para casa' };

// The preposition of `between`, said once over a coordinated landmark rather than on each conjunct
// (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`): `spatialHead` builds each conjunct with it as it
// builds any relation, and the complement lifts it off every conjunct to say it in front of all.
export const BETWEEN_PREP = 'entre';

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
 * The subordinating conjunctions (see PhrasePlan.adverbialClause, P09-E4). "Antes que" governs the
 * subjunctive, which the translator resolves the clause in; the others take the indicative.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'quando', while: 'enquanto', because: 'porque', after: 'depois que', before: 'antes que',
};

/**
 * The explanatory connectors among the clause conjunctions, set off by a comma after them as well as
 * before: "o gato corre, isto é, o cão pula". "portanto" heading its clause may go without one.
 */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is']);

/**
 * Adjectives invariable in gender and number, by base. A number used as an adjective is one ("a casa zero, os gatos zero");
 * so is a prepositional phrase standing for one ("a frase sem título"). The agreement rule would otherwise inflect
 * either like any adjective with its ending ("*sem títula").
 */
export const INVARIABLE_ADJ: ReadonlySet<string> = new Set(['zero', 'sem título']);

// O negador de um só constituinte, e não da oração: "corre **não** por causa do cão" — corre, e o
// cão não é a razão (ver `Complement.negative`).
export const CONSTITUENT_NEGATOR = 'não';

/** The focus particles (see NounPhrase.focus, C39). Portuguese writes all three before the phrase. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'só' }, even: { word: 'até' }, also: { word: 'também' },
};

/** The cardinals Portuguese spells (see `numeralWord`, C31); "um" and "dois" both agree. */
export const CARDINALS: CardinalTable = {
  1: { word: 'um', fem: 'uma' }, 2: { word: 'dois', fem: 'duas' }, 3: { word: 'três' }, 4: { word: 'quatro' },
  5: { word: 'cinco' }, 6: { word: 'seis' }, 7: { word: 'sete' }, 8: { word: 'oito' },
  9: { word: 'nove' }, 10: { word: 'dez' }, 11: { word: 'onze' }, 12: { word: 'doze' },
  24: { word: 'vinte e quatro' },
};

/**
 * How each temporal relation is spelled in Portuguese (C29). `de: true` marks the two locutions that
 * end in "de", so the article — and a demonstrative, which Portuguese contracts just as obligatorily
 * — fuses through it ("depois do dia", "antes deste dia"); the others govern the phrase directly.
 * `at` is not here: it is the contracting "em" ("neste dia") unless the head noun names its own
 * `temporal_prep`, so it goes through `contractDet` rather than a plain word. A lexeme that names
 * one takes the non-contracting `prepDet`, which is right for every word but "a", "de", "em" and
 * "por" — the four Portuguese fuses with. None names one today; one that needs "a" or "de" must
 * route through `contractDet` instead, or it will render "a o dia".
 *
 * "há" is an impersonal verb, not a preposition — "há um momento" is literally "it has a moment" —
 * but it stands where a preposition would and takes the phrase's own article, so its row is enough.
 */
export const PT_TEMPORAL: Record<Exclude<TemporalRelation, 'at'>, { word: string; de?: boolean }> = {
  ago: { word: 'há' },
  until: { word: 'até' },
  after: { word: 'depois', de: true },
  before: { word: 'antes', de: true },
  during: { word: 'durante' },
  // The spatial BETWEEN_PREP, which the group scope lifts off each conjunct (P09-E20).
  between: { word: 'entre' },
};

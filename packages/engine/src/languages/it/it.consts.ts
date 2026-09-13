import type { CoordConjunction, Degree, DimensionRelation, MannerRelation, ModifierRelation, Tense } from '@signi/shared';
import type { ConceptForms } from '../../types.js';

// The preposition each manner relation takes in Italian: similative "come" (fuses with nothing —
// "come il vento"), means "con", measure "a" (→ alla velocità), mode "in" (→ in modo). prepDet
// handles the article fusion; "come" and "con" take the non-fusing path.
export const IT_MANNER_PREP: Record<MannerRelation, 'come' | 'con' | 'a' | 'in'> = { similative: 'come', means: 'con', measure: 'a', mode: 'in' };

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "più"/"meno" in Italian — the noun phrase's definite article is what distinguishes
// them ("un gatto più grande" = a bigger cat vs "il gatto più grande" = the biggest), so
// only the adverb is added here. Equality uses the invariant "ugualmente".
export const IT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'più', most: 'più', less: 'meno', least: 'meno', equally: 'ugualmente',
};

export const VOWEL_START = /^[aeiouàèéìòù]/i;

/** Words that take "lo"/"gli" (s+consonant, z, ps, gn, x, y, …). */
export const SPECIAL_START = /^(s[^aeiou]|z|ps|gn|x|y)/i;

/**
 * Concept IDs of the common short adjectives that idiomatically precede the noun
 * in Italian (the "BAGS"-style set: beauty, age, goodness, size). Everything else
 * (e.g. felice, triste, forte, colours) stays after the noun. Both size adjectives
 * (grande/piccolo) precede, so they behave consistently — the trade-off is that a
 * size + beauty pair stacks before the noun ("il grande bel cane").
 */
// The ordinals join them: an ordinal precedes its noun in Italian ("il primo padre", "la
// seconda volta"), unlike the qualifying adjectives that follow it.
export const PRENOMINAL = new Set([
  'BIG', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL',
  'FIRST', 'SECOND', 'THIRD',
]);

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

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'o',
  but: 'ma',
  that_is: 'cioè',
  therefore: 'quindi',
  then: 'e poi',
};

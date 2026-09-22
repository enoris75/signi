import type { LanguageCode } from '@signi/shared';
import type { Forms } from '../languages/resolved.fixtures.js';
import type { LexiconLookup } from './translator.types.js';

// Hand-built lexicon for the translator's unit tests. The translator threads plan choices onto the
// looked-up forms — number, gender, determiner, degree, the pronoun surface — so each entry holds
// just the keys that decide what it threads, in Italian, the language with the most to agree. The
// rendering tests (translate, translateWord, translateDeterminer) build their own lookups for the
// languages they read.

export type { Forms };

/** A lookup over `entries`, the same forms in every language unless `byLanguage` gives one its own. */
export function lexicon(
  entries: Record<string, Forms>,
  byLanguage: Partial<Record<LanguageCode, Record<string, Forms>>> = {},
): LexiconLookup {
  return (conceptId, language) => {
    const forms = byLanguage[language as LanguageCode]?.[conceptId] ?? entries[conceptId];
    return forms ? { conceptId, language: language as LanguageCode, forms } : undefined;
  };
}

// ── Nouns ───────────────────────────────────────────────────────────────────

export const GATTO: Forms = { base: 'gatto', plural: 'gatti', gender: 'masc', fem: 'gatta', fem_plural: 'gatte' };
export const CANE: Forms = { base: 'cane', plural: 'cani', gender: 'masc' };
export const CASA: Forms = { base: 'casa', plural: 'case', gender: 'fem' };
/** Uncountable: no plural surface. */
export const ACQUA: Forms = { base: 'acqua', gender: 'fem', uncountable: '1' };
export const VELOCITA: Forms = { base: 'velocità', gender: 'fem', mannerRelation: 'measure' };
/** A measure that names a point in time, an occasion, not a rate (A235). */
export const TEMPO: Forms = { base: 'tempo', plural: 'tempi', gender: 'masc', mannerRelation: 'measure', temporal: '1' };
export const MODO: Forms = { base: 'modo', plural: 'modi', gender: 'masc', mannerRelation: 'mode' };

// ── Pronouns ────────────────────────────────────────────────────────────────

export const IO: Forms = { base: 'io', person: '1', plural: 'noi', disjunctive: 'me', disjunctive_plural: 'noi' };
export const TU: Forms = { base: 'tu', person: '2', plural: 'voi', disjunctive: 'te', disjunctive_plural: 'voi' };
export const LUI: Forms = {
  base: 'lui', person: '3', singular_fem: 'lei', plural: 'loro',
  disjunctive: 'lui', disjunctive_fem: 'lei', disjunctive_plural: 'loro',
};

// ── Adjectives, adverbs, verbs ──────────────────────────────────────────────

export const GRANDE: Forms = { role: 'adjective', base: 'grande' };
export const ROSSO: Forms = { role: 'adjective', base: 'rosso' };
export const FELICE: Forms = { role: 'adjective', base: 'felice' };
export const SEMPRE: Forms = { base: 'sempre', subtype: 'frequency' };
export const MANGIARE: Forms = { base: 'mangiare', '3sg_present': 'mangia' };
export const CORRERE: Forms = { base: 'correre', '3sg_present': 'corre' };
export const SCEGLIERE: Forms = { base: 'scegliere', gerund: 'scegliendo' };
export const ESSERE: Forms = { base: 'essere', '3sg_present': 'è', copula: '1' };
export const VOLERE: Forms = { base: 'volere', '3sg_present': 'vuole', nonfinite: 'voler' };

/** The entries above under the concept ids a plan names them by. */
export const LOOKUP = lexicon({
  CAT: GATTO, DOG: CANE, HOUSE: CASA, WATER: ACQUA, SPEED: VELOCITA, TIME: TEMPO, WAY: MODO,
  I: IO, YOU: TU, HE: LUI,
  BIG: GRANDE, RED: ROSSO, HAPPY: FELICE, ALWAYS: SEMPRE,
  EAT: MANGIARE, RUN: CORRERE, CHOOSE: SCEGLIERE, BE: ESSERE, WANT: VOLERE,
});

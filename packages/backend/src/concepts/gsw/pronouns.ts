import type { GswColumn } from './types.js';

// The pronouns, with nominative and accusative apart only where Zürichdeutsch keeps them apart —
// the first and second singular (ich/mich, du/dich) and the masculine third (er/in); everywhere else
// one form serves both (mir/eus is subject/object, the plural pronouns merge, P10 D7). Full forms,
// never the clitics (*i*, *en*, *s*): the engine places a pronoun where a noun phrase goes, and the
// style sheet writes what a stressed pronoun says.
export const GSW_PRONOUNS: GswColumn = {
  FIRST_PERSON: { base: 'ich', person: '1', number: 'singular', plural: 'mir', disjunctive: 'mir', disjunctive_plural: 'eus', object: 'mich', object_plural: 'eus' },
  SECOND_PERSON: { base: 'du', person: '2', number: 'singular', plural: 'ir', disjunctive: 'dir', disjunctive_plural: 'eu', object: 'dich', object_plural: 'eu' },
  THIRD_PERSON: {
    base: 'er', person: '3', number: 'singular', gender: 'masc', singular_fem: 'si', singular_neut: 'es', plural: 'si',
    disjunctive: 'im', disjunctive_fem: 'ire', disjunctive_neut: 'im', disjunctive_plural: 'ine',
    object: 'in', object_fem: 'si', object_neut: 'es', object_plural: 'si',
  },
  // *me* for Standard German *man* (P10-E6 D2).
  GENERIC_PERSON: { base: 'me', person: '3', number: 'singular', generic: '1', disjunctive: 'eim' },
  SOMETHING: { base: 'öppis', person: '3', number: 'singular', gender: 'neut', thing: '1', object: 'öppis', disjunctive: 'öppisem', negative: 'nüt' },
  EVERYTHING: { base: 'alles', person: '3', number: 'singular', gender: 'neut', thing: '1', object: 'alles', disjunctive: 'allem', with_other: 'alles anderi', with_other_disjunctive: 'allem andere' },
  SOMEONE: { base: 'öpper', person: '3', number: 'singular', gender: 'masc', object: 'öpper', disjunctive: 'öpperem', negative: 'niemer', negative_object: 'niemer', negative_disjunctive: 'niemerem' },
};

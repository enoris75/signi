import type { LanguageColumn } from '../types.js';

// The pronouns, keyed as Italian's are. Rumantsch Grischun is not pro-drop: the subject form is
// always rendered (P04 §2.2). `object`/`dative` are the unstressed clitics before the finite verb
// (*el ma vesa*, *jau al dun*); `disjunctive` the stressed forms after a preposition (*cun mai*,
// *per tai*). The third person has no neuter: a thing is *el* or *ella* by its gender, so the
// `_neut` keys repeat the masculine. The feminine plurals *ellas*, *las* are keys Italian lacks.
export const RM_RUMGR_PRONOUNS: LanguageColumn = {
  FIRST_PERSON: { base: 'jau', person: '1', number: 'singular', plural: 'nus', disjunctive: 'mai', disjunctive_plural: 'nus', object: 'ma', object_plural: 'ans' },
  SECOND_PERSON: { base: 'ti', person: '2', number: 'singular', plural: 'vus', disjunctive: 'tai', disjunctive_plural: 'vus', object: 'ta', object_plural: 'as' },
  // One clitic *al* for the masculine accusative and every dative singular (verify: whether the
  // feminine dative is *al* or *la*); plural dative *als*.
  THIRD_PERSON: {
    base: 'el', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella', singular_neut: 'el', plural: 'els', plural_fem: 'ellas',
    disjunctive: 'el', disjunctive_fem: 'ella', disjunctive_neut: 'el', disjunctive_plural: 'els', disjunctive_plural_fem: 'ellas',
    object: 'al', object_fem: 'la', object_neut: 'al', object_plural: 'als', object_plural_fem: 'las',
    dative: 'al', dative_fem: 'al', dative_neut: 'al', dative_plural: 'als', // (verify)
  },
  // *ins* for Italian's impersonal *si*: a subject pronoun, with the verb in the 3sg (*ins mangia*).
  GENERIC_PERSON: { base: 'ins', person: '3', number: 'singular', generic: '1' },
  SOMETHING: {
    base: 'insatge', person: '3', number: 'singular', thing: '1', object: 'insatge', disjunctive: 'insatge', negative: 'nagut',
    with_other: 'insatge auter', negative_with_other: 'nagut auter',
  },
  EVERYTHING: { base: 'tut', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tut', disjunctive: 'tut', with_other: 'tut il rest' },
  SOMEONE: {
    base: 'insatgi', person: '3', number: 'singular', gender: 'masc', object: 'insatgi', disjunctive: 'insatgi', negative: 'nagin',
    with_other: 'insatgi auter', negative_with_other: 'nagin auter',
  },
};

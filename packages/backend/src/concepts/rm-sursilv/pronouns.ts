import type { LanguageColumn } from '../types.js';

// The pronouns (P04-E5). Sursilvan always says its subject pronoun (jeu, ti, el/ella, nus, vus,
// els/ellas), and has no proclitic object pronouns: an object pronoun is the stressed form after the
// verb (jeu vesel tei), so `object` and `disjunctive` coincide, and the dative is a plus that form
// (ad el) (verify). ei is the neuter and impersonal subject (ei plova). GENERIC_PERSON is ins.
export const RM_SURSILV_PRONOUNS: LanguageColumn = {
  FIRST_PERSON: { base: 'jeu', person: '1', number: 'singular', plural: 'nus', disjunctive: 'mei', disjunctive_plural: 'nus', object: 'mei', object_plural: 'nus' },
  SECOND_PERSON: { base: 'ti', person: '2', number: 'singular', plural: 'vus', disjunctive: 'tei', disjunctive_plural: 'vus', object: 'tei', object_plural: 'vus' },
  THIRD_PERSON: {
    base: 'el', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella', singular_neut: 'ei', plural: 'els', plural_fem: 'ellas',
    disjunctive: 'el', disjunctive_fem: 'ella', disjunctive_neut: 'quei', disjunctive_plural: 'els', disjunctive_plural_fem: 'ellas',
    object: 'el', object_fem: 'ella', object_neut: 'quei', object_plural: 'els', object_plural_fem: 'ellas',
    dative: 'ad el', dative_fem: 'ad ella', dative_neut: 'a quei', dative_plural: 'ad els',
  },
  GENERIC_PERSON: { base: 'ins', person: '3', number: 'singular', generic: '1' },
  SOMETHING: {
    base: 'enzatgei', person: '3', number: 'singular', thing: '1', object: 'enzatgei', disjunctive: 'enzatgei',
    negative: 'nuot', with_other: 'enzatgei auter', negative_with_other: 'nuot auter',
  },
  EVERYTHING: { base: 'tut', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tut', disjunctive: 'tut', with_other: 'tut il rest' },
  SOMEONE: {
    base: 'enzatgi', person: '3', number: 'singular', gender: 'masc', object: 'enzatgi', disjunctive: 'enzatgi',
    negative: 'negin', with_other: 'enzatgi auter', negative_with_other: 'negin auter',
  },
};

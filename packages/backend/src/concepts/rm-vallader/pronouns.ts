import type { LanguageColumn } from '../types.js';

// Vallader is not pro-drop: the subject pronoun is always said (eu, tü, el/ella, nus, vus,
// els/ellas). `disjunctive` is the stressed form after a preposition (cun mai, per tai); `object`
// the unstressed clitic before the verb (el am vezza, eu til vez). The dative clitics are taken to
// be the accusative ones (verify).
export const RM_VALLADER_PRONOUNS: LanguageColumn = {
  FIRST_PERSON: { base: 'eu', person: '1', number: 'singular', plural: 'nus', disjunctive: 'mai', disjunctive_plural: 'nus', object: 'am', object_plural: 'ans' },
  SECOND_PERSON: { base: 'tü', person: '2', number: 'singular', plural: 'vus', disjunctive: 'tai', disjunctive_plural: 'vus', object: 'at', object_plural: 'as' },
  THIRD_PERSON: {
    // No neuter: a thing is el or ella by its noun's gender, so singular_neut is el. The feminine
    // plural ellas has no Italian key to mirror and is added (plural_fem).
    base: 'el', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella', singular_neut: 'el', plural: 'els', plural_fem: 'ellas',
    disjunctive: 'el', disjunctive_fem: 'ella', disjunctive_neut: 'el', disjunctive_plural: 'els',
    object: 'til', object_fem: 'tilla', object_neut: 'til', object_plural: 'tils', object_plural_fem: 'tillas',
    dative: 'til', dative_fem: 'tilla', dative_neut: 'til', dative_plural: 'tils', // (verify) dative clitics
  },
  // ins: the generic subject (ins disch = one says).
  GENERIC_PERSON: { base: 'ins', person: '3', number: 'singular', generic: '1' },
  // alch / nöglia (Puter has ünguotta, not Vallader).
  SOMETHING: { base: 'alch', person: '3', number: 'singular', thing: '1', object: 'alch', disjunctive: 'alch', negative: 'nöglia', with_other: 'alch oter', negative_with_other: 'nöglia oter' },
  EVERYTHING: { base: 'tuot', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tuot', disjunctive: 'tuot', with_other: 'tuot il rest' },
  // qualchün / ingün (Puter üngün).
  SOMEONE: { base: 'qualchün', person: '3', number: 'singular', gender: 'masc', object: 'qualchün', disjunctive: 'qualchün', negative: 'ingün', with_other: 'qualchün oter', negative_with_other: 'ingün oter' },
};

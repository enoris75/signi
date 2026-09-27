import type { LanguageColumn } from '../types.js';

// The pronouns, keyed as Spanish's are, since the Catalan engine is Spanish's fork. Catalan is
// pro-drop as Spanish. `disjunctive` is the strong form after a preposition (*per a mi*, *amb tu*);
// `object` and `dative` the weak pronouns in their full proclitic form (*em veu*, *el veig*, *li
// dono*): the elided (*m'*, *l'*) and enclitic (*-me*, *-lo*) forms are the engine's. The first and
// second plurals have one form for both genders (*nosaltres*, *vosaltres*), so `plural_fem` repeats
// it. The third person's neuter object is *ho* (*ho sé*). Every form is (verify) until the native
// review (P03-E11).
export const CA_PRONOUNS: LanguageColumn = {
  FIRST_PERSON: {
    base: 'jo', person: '1', number: 'singular', plural: 'nosaltres', plural_fem: 'nosaltres',
    disjunctive: 'mi', disjunctive_plural: 'nosaltres', disjunctive_plural_fem: 'nosaltres', object: 'em', object_plural: 'ens',
  },
  SECOND_PERSON: {
    base: 'tu', person: '2', number: 'singular', plural: 'vosaltres', plural_fem: 'vosaltres',
    disjunctive: 'tu', disjunctive_plural: 'vosaltres', disjunctive_plural_fem: 'vosaltres', object: 'et', object_plural: 'us',
  },
  // Catalan has no neuter personal pronoun: Spanish *ello* is *això* (verify), the object *ho*.
  THIRD_PERSON: {
    base: 'ell', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella', singular_neut: 'això', plural: 'ells', plural_fem: 'elles',
    disjunctive: 'ell', disjunctive_fem: 'ella', disjunctive_neut: 'això', disjunctive_plural: 'ells', disjunctive_plural_fem: 'elles',
    object: 'el', object_fem: 'la', object_neut: 'ho', object_plural: 'els', object_plural_fem: 'les',
    dative: 'li', dative_plural: 'els',
  },
  // The impersonal *es* (*es menja*, P03 D5); a reflexive verb, which would say *es* twice, takes
  // *un* instead (*un es renta*), and *un* is the dative too (*li agrada a un*) (verify both).
  GENERIC_PERSON: { base: 'es', person: '3', number: 'singular', generic: '1', generic_reflexive: 'un', disjunctive: 'un' },
  SOMETHING: {
    base: 'alguna cosa', person: '3', number: 'singular', thing: '1', object: 'alguna cosa', disjunctive: 'alguna cosa', negative: 'res',
    with_other: 'una altra cosa', negative_with_other: 'res més',
  },
  EVERYTHING: {
    base: 'tot', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tot', disjunctive: 'tot', with_other: 'tota la resta', // (verify)
  },
  SOMEONE: { base: 'algú', person: '3', number: 'singular', gender: 'masc', object: 'algú', disjunctive: 'algú', negative: 'ningú' },
};

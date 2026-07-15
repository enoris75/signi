import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A pronoun in the DIRECT-OBJECT slot — "the cat sees me / you / him". A pronoun object is not a
// noun object: it takes the language's oblique/accusative form, no article, and in Romance it is a
// PROCLITIC that moves in front of the finite verb ("il gatto MI vede", not "vede il gatto"). Only
// the subject slot has been exercised until now; this file covers the object slot.
const sees = (concept: string, extra: Partial<NounPhrase> = {}) =>
  sayAll(clause(np('CAT'), 'SEE', { directObject: np(concept, extra) }));

// The six person/number cells, plus the feminine third singular (which selects a distinct form in
// most languages: her / la / elle / sie / ella).
const P1SG = ['FIRST_PERSON', {}] as const;
const P1PL = ['FIRST_PERSON', { number: 'plural' }] as const;
const P2SG = ['SECOND_PERSON', {}] as const;
const P2PL = ['SECOND_PERSON', { number: 'plural' }] as const;
const P3SG = ['THIRD_PERSON', {}] as const;
const P3PL = ['THIRD_PERSON', { number: 'plural' }] as const;
const P3SGF = ['THIRD_PERSON', { gender: 'fem' }] as const;

// Japanese is correct out of the box: a pronoun object is marked with を exactly like a noun
// object, and Japanese has no article to wrongly attach and no clitic movement — so the surface is
// right for every person.
describe('object pronoun: Japanese', () => {
  test('every person takes を on the oblique pronoun', () => {
    expect(sees(...P1SG).ja).toBe('猫は私を見ます。');
    expect(sees(...P1PL).ja).toBe('猫は私たちを見ます。');
    expect(sees(...P2SG).ja).toBe('猫はあなたを見ます。');
    expect(sees(...P2PL).ja).toBe('猫はあなたたちを見ます。');
    expect(sees(...P3SG).ja).toBe('猫は彼を見ます。');
    expect(sees(...P3PL).ja).toBe('猫は彼らを見ます。');
    expect(sees(...P3SGF).ja).toBe('猫は彼女を見ます。');
  });
});

// The European languages all get this wrong the same way: the engine renders a pronoun object as
// though it were a NOUN — it prepends an article and keeps the nominative citation form ("the cat
// sees THE I", "il gatto vede L'IO", "der Kater sieht DEN ICH"). A pronoun takes no article, uses
// its object form, and in Romance cliticises before the verb. Each `test.fails` asserts the
// correct target; drop the marker when the engine cliticises/case-marks a pronoun object.
//
// Root: a pronoun head in an object slot is routed through the noun-phrase renderer (determiner +
// citation form) instead of a pronoun-object path. Same defect in all six, one per language below.
describe('known bugs: object pronoun', () => {
  test.fails('English uses the object form, no article: "sees me/us/you/him/her/them"', () => {
    expect(sees(...P1SG)).toMatchObject({ en: 'the cat sees me.' });
    expect(sees(...P1PL)).toMatchObject({ en: 'the cat sees us.' });
    expect(sees(...P2SG)).toMatchObject({ en: 'the cat sees you.' });
    expect(sees(...P3SG)).toMatchObject({ en: 'the cat sees him.' });
    expect(sees(...P3SGF)).toMatchObject({ en: 'the cat sees her.' });
    expect(sees(...P3PL)).toMatchObject({ en: 'the cat sees them.' });
  });

  test.fails('Italian cliticises before the verb: "il gatto mi/ti/lo/la/ci/vi/li vede"', () => {
    expect(sees(...P1SG)).toMatchObject({ it: 'il gatto mi vede.' });
    expect(sees(...P1PL)).toMatchObject({ it: 'il gatto ci vede.' });
    expect(sees(...P2SG)).toMatchObject({ it: 'il gatto ti vede.' });
    expect(sees(...P2PL)).toMatchObject({ it: 'il gatto vi vede.' });
    expect(sees(...P3SG)).toMatchObject({ it: 'il gatto lo vede.' });
    expect(sees(...P3SGF)).toMatchObject({ it: 'il gatto la vede.' });
    expect(sees(...P3PL)).toMatchObject({ it: 'il gatto li vede.' });
  });

  test.fails('French cliticises before the verb: "le chat me/te/le/la/nous/vous/les voit"', () => {
    expect(sees(...P1SG)).toMatchObject({ fr: 'le chat me voit.' });
    expect(sees(...P1PL)).toMatchObject({ fr: 'le chat nous voit.' });
    expect(sees(...P2SG)).toMatchObject({ fr: 'le chat te voit.' });
    expect(sees(...P2PL)).toMatchObject({ fr: 'le chat vous voit.' });
    expect(sees(...P3SG)).toMatchObject({ fr: 'le chat le voit.' });
    expect(sees(...P3SGF)).toMatchObject({ fr: 'le chat la voit.' });
    expect(sees(...P3PL)).toMatchObject({ fr: 'le chat les voit.' });
  });

  test.fails('Spanish cliticises before the verb: "el gato me/te/lo/la/nos/os/los ve"', () => {
    expect(sees(...P1SG)).toMatchObject({ es: 'el gato me ve.' });
    expect(sees(...P1PL)).toMatchObject({ es: 'el gato nos ve.' });
    expect(sees(...P2SG)).toMatchObject({ es: 'el gato te ve.' });
    expect(sees(...P2PL)).toMatchObject({ es: 'el gato os ve.' }); // vosotros → os
    expect(sees(...P3SG)).toMatchObject({ es: 'el gato lo ve.' }); // etymological accusative (not leísta "le")
    expect(sees(...P3SGF)).toMatchObject({ es: 'el gato la ve.' });
    expect(sees(...P3PL)).toMatchObject({ es: 'el gato los ve.' });
  });

  // Portuguese asserted as the Brazilian proclitic ("o gato me vê"), consistent with the corpus's
  // Brazilian choices elsewhere (você / vocês). European Portuguese would enclise ("o gato vê-me");
  // whichever is chosen, the current "o gato vê o eu" — article + nominative — is wrong.
  test.fails('Portuguese cliticises: "o gato me/te/o/a/nos/vos/os vê"', () => {
    expect(sees(...P1SG)).toMatchObject({ pt: 'o gato me vê.' });
    expect(sees(...P1PL)).toMatchObject({ pt: 'o gato nos vê.' });
    expect(sees(...P2SG)).toMatchObject({ pt: 'o gato te vê.' });
    expect(sees(...P3SG)).toMatchObject({ pt: 'o gato o vê.' });
    expect(sees(...P3SGF)).toMatchObject({ pt: 'o gato a vê.' });
    expect(sees(...P3PL)).toMatchObject({ pt: 'o gato os vê.' });
  });

  test.fails('German uses the accusative form, no article: "sieht mich/dich/ihn/sie/uns/euch"', () => {
    expect(sees(...P1SG)).toMatchObject({ de: 'der Kater sieht mich.' });
    expect(sees(...P1PL)).toMatchObject({ de: 'der Kater sieht uns.' });
    expect(sees(...P2SG)).toMatchObject({ de: 'der Kater sieht dich.' });
    expect(sees(...P2PL)).toMatchObject({ de: 'der Kater sieht euch.' });
    expect(sees(...P3SG)).toMatchObject({ de: 'der Kater sieht ihn.' }); // er → ihn in the accusative
    expect(sees(...P3SGF)).toMatchObject({ de: 'der Kater sieht sie.' });
    expect(sees(...P3PL)).toMatchObject({ de: 'der Kater sieht sie.' });
  });

  // The single clearest symptom, asserted directly: no European language should attach an article
  // to a pronoun object. This is what "the cat sees THE I" / "vede L'IO" / "sieht DEN ICH" all share.
  test.fails('no European language attaches an article to a pronoun object', () => {
    expect(sees(...P1SG).en).not.toContain('the I');
    expect(sees(...P1SG).it).not.toContain("l'io");
    expect(sees(...P1SG).fr).not.toContain('le je');
    expect(sees(...P1SG).es).not.toContain('el yo');
    expect(sees(...P1SG).pt).not.toContain('o eu');
    expect(sees(...P1SG).de).not.toContain('den ich');
  });
});

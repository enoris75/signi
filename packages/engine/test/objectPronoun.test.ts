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

// The European languages used to get this wrong the same way: the engine rendered a pronoun object
// as though it were a NOUN — an article on the nominative citation form ("the cat sees THE I", "il
// gatto vede L'IO", "der Kater sieht DEN ICH"). A pronoun object now takes no article and its object
// form: English/German use it post-verbally ("sees me", "sieht ihn"), and Romance cliticises it
// before the finite verb ("il gatto mi vede"). One per language below.
describe('known bugs: object pronoun', () => {
  test('English uses the object form, no article: "sees me/us/you/him/her/them"', () => {
    expect(sees(...P1SG)).toMatchObject({ en: 'the cat sees me.' });
    expect(sees(...P1PL)).toMatchObject({ en: 'the cat sees us.' });
    expect(sees(...P2SG)).toMatchObject({ en: 'the cat sees you.' });
    expect(sees(...P3SG)).toMatchObject({ en: 'the cat sees him.' });
    expect(sees(...P3SGF)).toMatchObject({ en: 'the cat sees her.' });
    expect(sees(...P3PL)).toMatchObject({ en: 'the cat sees them.' });
  });

  test('Italian cliticises before the verb: "il gatto mi/ti/lo/la/ci/vi/li vede"', () => {
    expect(sees(...P1SG)).toMatchObject({ it: 'il gatto mi vede.' });
    expect(sees(...P1PL)).toMatchObject({ it: 'il gatto ci vede.' });
    expect(sees(...P2SG)).toMatchObject({ it: 'il gatto ti vede.' });
    expect(sees(...P2PL)).toMatchObject({ it: 'il gatto vi vede.' });
    expect(sees(...P3SG)).toMatchObject({ it: 'il gatto lo vede.' });
    expect(sees(...P3SGF)).toMatchObject({ it: 'il gatto la vede.' });
    expect(sees(...P3PL)).toMatchObject({ it: 'il gatto li vede.' });
  });

  test('French cliticises before the verb: "le chat me/te/le/la/nous/vous/les voit"', () => {
    expect(sees(...P1SG)).toMatchObject({ fr: 'le chat me voit.' });
    expect(sees(...P1PL)).toMatchObject({ fr: 'le chat nous voit.' });
    expect(sees(...P2SG)).toMatchObject({ fr: 'le chat te voit.' });
    expect(sees(...P2PL)).toMatchObject({ fr: 'le chat vous voit.' });
    expect(sees(...P3SG)).toMatchObject({ fr: 'le chat le voit.' });
    expect(sees(...P3SGF)).toMatchObject({ fr: 'le chat la voit.' });
    expect(sees(...P3PL)).toMatchObject({ fr: 'le chat les voit.' });
  });

  test('Spanish cliticises before the verb: "el gato me/te/lo/la/nos/os/los ve"', () => {
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
  test('Portuguese cliticises: "o gato me/te/o/a/nos/vos/os vê"', () => {
    expect(sees(...P1SG)).toMatchObject({ pt: 'o gato me vê.' });
    expect(sees(...P1PL)).toMatchObject({ pt: 'o gato nos vê.' });
    expect(sees(...P2SG)).toMatchObject({ pt: 'o gato te vê.' });
    expect(sees(...P3SG)).toMatchObject({ pt: 'o gato o vê.' });
    expect(sees(...P3SGF)).toMatchObject({ pt: 'o gato a vê.' });
    expect(sees(...P3PL)).toMatchObject({ pt: 'o gato os vê.' });
  });

  test('German uses the accusative form, no article: "sieht mich/dich/ihn/sie/uns/euch"', () => {
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
  test('no European language attaches an article to a pronoun object', () => {
    expect(sees(...P1SG).en).not.toContain('the I');
    expect(sees(...P1SG).it).not.toContain("l'io");
    expect(sees(...P1SG).fr).not.toContain('le je');
    expect(sees(...P1SG).es).not.toContain('el yo');
    expect(sees(...P1SG).pt).not.toContain('o eu');
    expect(sees(...P1SG).de).not.toContain('den ich');
  });

  // Negation composes with the clitic/object placement: English do-support, German "nicht" after
  // the object, and the Romance clitic sitting inside the negator ("non/ne … pas/no/não me …").
  const seesNeg = (concept: string, extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: np(concept, extra), verbPhrase: { negative: true } }));
  test('negation composes with the object pronoun', () => {
    expect(seesNeg(...P1SG)).toMatchObject({
      en: 'the cat does not see me.',
      de: 'der Kater sieht mich nicht.',
      it: 'il gatto non mi vede.',
      fr: 'le chat ne me voit pas.',
      es: 'el gato no me ve.',
      pt: 'o gato não me vê.',
    });
  });

  // French elides me/te/le/la → m'/t'/l' before a vowel-initial verb ("m'ajoute", "l'ajoute").
  const frAdds = (concept: string) =>
    sayAll(clause(np('CAT'), 'ADD', { directObject: np(concept) })).fr;
  test('French elides the clitic before a vowel-initial verb', () => {
    expect(frAdds('FIRST_PERSON')).toBe("le chat m'ajoute.");
    expect(frAdds('THIRD_PERSON')).toBe("le chat l'ajoute.");
  });

  // The neuter third person takes its own object form ("lo" / "es" / "it").
  test('the neuter third person object', () => {
    expect(sees('THIRD_PERSON', { gender: 'neut' })).toMatchObject({
      en: 'the cat sees it.',
      it: 'il gatto lo vede.',
      de: 'der Kater sieht es.',
    });
  });

  // Regression: a NOUN direct object is untouched — it keeps its article and post-verbal position.
  test('a noun direct object is unchanged', () => {
    expect(sees('MOUSE')).toMatchObject({
      en: 'the cat sees the mouse.',
      it: 'il gatto vede il topo.',
      fr: 'le chat voit la souris.',
      es: 'el gato ve el ratón.',
      pt: 'o gato vê o rato.',
      de: 'der Kater sieht die Maus.',
    });
  });
});

import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A third-person pronoun subject, across the three gender values. `gender` on a NOUN head is a
// no-op (see subject.test.ts); on a third-person pronoun it selects the surface form — he / she /
// it — which is the one place the `neut` value is meaningful.
const third = (extra: Partial<NounPhrase>) => sayAll(clause(np('THIRD_PERSON', extra), 'EAT'));

describe('third-person pronoun by gender', () => {
  test('masculine is the default', () => {
    expect(third({})).toMatchObject({
      en: 'he eats.', it: 'lui mangia.', fr: 'il mange.', es: 'él come.',
      pt: 'ele come.', de: 'er isst.', ja: '彼は食べます。',
    });
    expect(third({ gender: 'masc' })).toEqual(third({}));
  });

  test('feminine selects the feminine pronoun', () => {
    expect(third({ gender: 'fem' })).toMatchObject({
      en: 'she eats.', it: 'lei mangia.', fr: 'elle mange.', es: 'ella come.',
      pt: 'ela come.', de: 'sie isst.', ja: '彼女は食べます。',
    });
  });

  // The neuter VALUE is meaningful only here. Each language has its own genderless "it" — Italian
  // "esso", German "es", Japanese それ; the ones without a neuter personal pronoun reach for the
  // demonstrative/neuter form (fr "cela", es "ello", pt "isso") — and it is distinct from both
  // the masculine and the feminine.
  test('neuter selects the language\'s "it", distinct from he and she', () => {
    const it = third({ gender: 'neut' });
    expect(it).toMatchObject({
      en: 'it eats.', it: 'esso mangia.', fr: 'cela mange.', es: 'ello come.',
      pt: 'isso come.', de: 'es isst.', ja: 'それは食べます。',
    });
    // Not the masculine, and not the feminine.
    expect(it).not.toMatchObject({ en: 'he eats.' });
    expect(it.it).not.toBe('lui mangia.');
    expect(it.it).not.toBe('lei mangia.');
    expect(it.de).not.toBe('er isst.');
  });

  test('a neuter subject takes a masculine-default predicate adjective', () => {
    // Neuter has no distinct adjective form, so the predicate agrees as the masculine would.
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'neut' }), 'SEEM', {
      complements: { predicative: { phrase: np('BIG') } },
    }))).toMatchObject({
      en: 'it seems big.', it: 'esso sembra grande.', fr: 'cela semble grand.',
      es: 'ello parece grande.', de: 'es scheint groß.',
    });
  });

  // The plural has no neuter pronoun in any of the seven — a group of "it"s is "they" — so a neuter
  // third plural is the genderless plural form, identical to the (masculine-default) plain plural.
  test('neuter is a no-op in the plural — a neuter "they" is the plain "they"', () => {
    const neutPl = sayAll(clause(np('THIRD_PERSON', { gender: 'neut', number: 'plural' }), 'EAT'));
    expect(neutPl).toMatchObject({
      en: 'they eat.', it: 'loro mangiano.', fr: 'ils mangent.', es: 'ellos comen.',
      pt: 'eles comem.', de: 'sie essen.', ja: '彼らは食べます。',
    });
    expect(neutPl).toEqual(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT')));
  });
});

describe('known bugs: feminine plural pronoun', () => {
  // French, Spanish and Portuguese have a distinct FEMININE plural personal pronoun (elles / ellas /
  // elas), which the engine now selects for a feminine-plural pronoun (it used to render the
  // masculine). Italian ("loro"), German ("sie") and English ("they") have no gendered plural, so
  // they are unaffected.
  test('a feminine third-plural pronoun is elles / ellas / elas, not the masculine', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'RUN')))
      .toMatchObject({
        fr: 'elles courent.', // not "ils courent."
        es: 'ellas corren.',
        pt: 'elas correm.',
      });
  });

  // The tell that this is a surface-form miss and not a lost feature: the agreement GENDER is
  // tracked correctly — the predicate adjective comes out feminine ("grandes") — so the phrase is
  // internally contradictory, a masculine pronoun with a feminine adjective ("ils semblent
  // grandes"). Only the pronoun's own form is wrong.
  test('the pronoun surface must match the feminine agreement it already carries', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'SEEM', {
      complements: { predicative: { phrase: np('BIG') } },
    }))).toMatchObject({
      fr: 'elles semblent grandes.', // the adjective is already "grandes"; the pronoun should be "elles"
      es: 'ellas parecen grandes.',
      pt: 'elas parecem grandes.',
    });
  });

  // Spanish carries the feminine through the whole plural paradigm (nosotras / vosotras / ellas), so
  // the miss is not limited to the third person: a feminine first-plural is "nosotras", not
  // "nosotros".
  test('Spanish feminine first-plural is "nosotras", not "nosotros"', () => {
    expect(sayAll(clause(np('FIRST_PERSON', { gender: 'fem', number: 'plural' }), 'RUN')))
      .toMatchObject({ es: 'nosotras corremos.' });
  });

  // …and the second-plural completes the Spanish paradigm: "vosotras", not "vosotros".
  test('Spanish feminine second-plural is "vosotras"', () => {
    expect(sayAll(clause(np('SECOND_PERSON', { gender: 'fem', number: 'plural' }), 'RUN')))
      .toMatchObject({ es: 'vosotras corréis.' });
  });

  // Regression: a MASCULINE plural is unchanged (the default gender), across all three.
  test('a masculine plural pronoun is unchanged', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'RUN'))).toMatchObject({
      fr: 'ils courent.',
      es: 'ellos corren.',
      pt: 'eles correm.',
    });
    expect(sayAll(clause(np('FIRST_PERSON', { number: 'plural' }), 'RUN')).es).toBe('nosotros corremos.');
  });

  // Regression: French and Portuguese have no distinct feminine first-plural, so a feminine referent
  // keeps the invariant "nous" / "nós"; and the languages with no gendered plural are untouched.
  test('languages without a feminine plural keep their invariant form', () => {
    const fem3pl = { gender: 'fem', number: 'plural' } as const;
    expect(sayAll(clause(np('FIRST_PERSON', { gender: 'fem', number: 'plural' }), 'RUN'))).toMatchObject({
      fr: 'nous courons.',
      pt: 'nós corremos.',
    });
    expect(sayAll(clause(np('THIRD_PERSON', fem3pl), 'RUN'))).toMatchObject({
      it: 'loro corrono.',
      de: 'sie laufen.',
      en: 'they run.',
    });
  });
});

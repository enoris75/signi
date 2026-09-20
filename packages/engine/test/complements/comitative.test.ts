import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The COMITATIVE (localization C12) — the companion an act is carried out *together with*, as
// against the `instrumental` means it is carried out *by*. English spells both "with" and so do
// the Romance languages ("con" / "avec" / "com") and German ("mit"); Japanese is the one engine
// here that keeps them apart, marking the companion と and the means で.
const coordinates = (phrase: NounPhrase) =>
  sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase } } }));

describe('comitative', () => {
  test('the companion of the act', () => {
    expect(coordinates(np('DOG'))).toEqual({
      en: 'the cat coordinates with the dog.',
      it: 'il gatto coordina con il cane.',
      fr: 'le chat coordonne avec le chien.',
      de: 'der Kater koordiniert mit dem Hund.',
      es: 'el gato coordina con el perro.',
      ja: '猫は犬と調整します。',
      pt: 'o gato coordena com o cão.',
    });
  });

  test('it carries its own determiner, as the other adposition-bearing complements do', () => {
    expect(coordinates(np('DOG', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat coordinates with a dog.',
      it: 'il gatto coordina con un cane.',
      de: 'der Kater koordiniert mit einem Hund.', // dative after "mit"
      pt: 'o gato coordena com um cão.',
    });
  });

  test('it stands beside an instrument without collapsing into it', () => {
    expect(sayAll(clause(np('CAT'), 'COORDINATE', {
      complements: {
        comitative: { phrase: np('DOG') },
        instrumental: { phrase: np('WORD', { definiteness: 'indefinite' }) },
      },
    }))).toMatchObject({
      // Six of the seven say "with" twice; only Japanese tells the two apart, と for the
      // companion and で for the means.
      en: 'the cat coordinates with the dog with a word.',
      it: 'il gatto coordina con il cane con una parola.',
      de: 'der Kater koordiniert mit dem Hund mit einem Wort.',
      ja: '猫は犬と単語で調整します。',
    });
  });

  test('COORDINATE licenses it — the verb whose whole meaning is doing a thing alongside', () => {
    expect(coordinates(np('DOG')).en).toContain('with the dog');
  });
});

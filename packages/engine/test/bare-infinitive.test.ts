import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C36: LET. It governs the object-controlled infinitive C08 built for CAUSE_VERB, and
// adds the two things that construct had no room for — the **bare** infinitive of English and
// German, and the Japanese **causative**, which is a suffix on the governed verb and no verb of its
// own.

const seed = (id: string) => concepts.find((c) => c.id === id);

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = seed(id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const lets = (governed: Parameters<typeof clause>[2]) => clause(np('CAT'), 'LET', {
  directObject: np('DOG'),
  infinitiveComplement: { verbPhrase: { verb: 'RUN' }, control: 'object' },
  ...governed,
});

describe('LET governs a bare infinitive', () => {
  test('the seven renderings', () => {
    expect(sayAll(lets({}))).toEqual({
      en: 'the cat lets the dog run.', it: 'il gatto lascia il cane correre.',
      fr: 'le chat laisse le chien courir.', de: 'der Kater lässt den Hund laufen.',
      es: 'el gato deja el perro correr.', ja: '猫は犬を走らせます。', pt: 'o gato deixa o cão correr.',
    });
  });

  // The shipped causative still writes its linking word and German's comma — the difference is
  // lexical, not a change of construct.
  test('CAUSE_VERB is untouched', () => {
    expect(sayAll(clause(np('CAT'), 'CAUSE_VERB', {
      directObject: np('DOG'), infinitiveComplement: { verbPhrase: { verb: 'RUN' }, control: 'object' },
    }))).toMatchObject({
      en: 'the cat causes the dog to run.', de: 'der Kater veranlasst den Hund, zu laufen.',
      it: 'il gatto induce il cane a correre.', ja: '猫は犬が走るようにします。',
    });
  });

  test('tense and negation leave the cluster where it is', () => {
    expect(say(lets({ verbPhrase: { tense: 'past' } }), 'de')).toBe('der Kater ließ den Hund laufen.');
    expect(say(lets({ verbPhrase: { negative: true } }), 'de')).toBe('der Kater lässt den Hund nicht laufen.');
    expect(say(lets({ verbPhrase: { negative: true } }), 'en')).toBe('the cat does not let the dog run.');
  });

  // German puts its verb cluster behind the finite verb in a V2 clause and in front of it in a
  // verb-final one — the Ersatzinfinitiv order, which the citation shows.
  test('the German citation writes the cluster the other way round', () => {
    expect(say({
      subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'LET' },
      directObject: np('PERSON', { definiteness: 'indefinite' }),
      infinitiveComplement: { verbPhrase: { verb: 'ACT' }, control: 'object' },
      infinitive: true,
    }, 'de')).toBe('eine Person handeln lassen.');
  });
});

describe('the Japanese causative', () => {
  test('the causee takes を when what it does is intransitive, に when that verb has an object', () => {
    expect(say(lets({}), 'ja')).toBe('猫は犬を走らせます。');
    expect(say(clause(np('CAT'), 'LET', {
      directObject: np('DOG'),
      infinitiveComplement: { verbPhrase: { verb: 'EAT' }, directObject: np('FOOD'), control: 'object' },
    }), 'ja')).toBe('猫は犬に食べ物を食べさせます。');
  });

  // 〜せる/させる is itself an ichidan verb, so tense, negation and the polite paradigm all follow.
  test('the suffix carries the tense and the negation', () => {
    expect(say(lets({ verbPhrase: { tense: 'past' } }), 'ja')).toBe('猫は犬を走らせました。');
    expect(say(lets({ verbPhrase: { negative: true } }), 'ja')).toBe('猫は犬を走らせません。');
  });
});

describe('the words', () => {
  test('LET is glossed by the permission it gives', () => {
    expect(definitionAll('LET')).toEqual({
      en: 'to cause a person to be allowed to act.',
      it: 'indurre una persona a essere autorizzata ad agire.',
      fr: 'induire une personne à être autorisée à agir.',
      de: 'eine Person veranlassen, berechtigt zu sein, zu handeln.',
      es: 'inducir a una persona a estar autorizada a actuar.',
      ja: '人が行動することが許可されているようにする。',
      pt: 'induzir uma pessoa a estar autorizada a agir.',
    });
  });

  // Literal by design: the state LET leaves says "left" in German and Italian, and every other lead
  // defines ALLOWED by the word it was seeded for (see the ticket).
  test('ALLOWED stays on the literal', () => {
    expect(seed('ALLOWED')?.definition).toBeUndefined();
  });
});

import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C32: SOMETHING, the pronoun that stands for a thing and turns into another word
// under negation. The seeded persons have one form each; this one has two, and the negative half
// carries the concord every language spells differently.

const seed = (id: string) => concepts.find((c) => c.id === id);

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = seed(id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('the positive pronoun', () => {
  test('as a direct object, and as a subject', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('SOMETHING') }))).toEqual({
      en: 'the cat eats something.', it: 'il gatto mangia qualcosa.', fr: 'le chat mange quelque chose.',
      de: 'der Kater frisst etwas.', es: 'el gato come algo.', ja: '猫は何かを食べます。', pt: 'o gato come algo.',
    });
    // It is a pronoun by its lexicon and a phrase by its syntax: no Romance clitic, and no pro-drop
    // — "qualcosa mangia", never a bare "mangia" (see `isPronounElement`).
    expect(sayAll(clause(np('SOMETHING'), 'EAT'))).toEqual({
      en: 'something eats.', it: 'qualcosa mangia.', fr: 'quelque chose mange.', de: 'etwas isst.',
      es: 'algo come.', ja: '何かは食べます。', pt: 'algo come.',
    });
  });

  test('the Spanish and Portuguese personal "a" marks a person, so a thing takes none', () => {
    expect(say(clause(np('CAT'), 'EAT', { directObject: np('SOMETHING') }), 'es')).toBe('el gato come algo.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('SOMETHING') }), 'pt')).toBe('o gato vê algo.');
  });
});

describe('the negative pronoun', () => {
  // Each language spells the concord its own way: English leaves the negation on the verb and says
  // "anything"; the Romance languages keep their preverbal negator beside the negative word; German
  // and French let the word carry the negation alone, so "nicht" and "pas" give way.
  test('as a direct object', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('SOMETHING'),
    }))).toEqual({
      en: 'the cat does not eat anything.', it: 'il gatto non mangia niente.',
      fr: 'le chat ne mange rien.', de: 'der Kater frisst nichts.', es: 'el gato no come nada.',
      ja: '猫は何も食べません。', pt: 'o gato não come nada.',
    });
  });

  // English has a third form in the subject slot, where the pronoun absorbs the negation:
  // "nothing eats", not "*anything does not eat".
  test('as a subject', () => {
    expect(sayAll(clause(np('SOMETHING'), 'EAT', { verbPhrase: { negative: true } }))).toEqual({
      en: 'nothing eats.', it: 'niente mangia.', fr: 'rien ne mange.', de: 'nichts isst.',
      es: 'nada come.', ja: '何も食べません。', pt: 'nada come.',
    });
  });

  test('tense rides on it unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { tense: 'past', negative: true }, directObject: np('SOMETHING'),
    }))).toMatchObject({
      en: 'the cat did not eat anything.', it: 'il gatto non mangiò niente.',
      fr: 'le chat ne mangea rien.', de: 'der Kater fraß nichts.', ja: '猫は何も食べませんでした。',
    });
  });

  test('Japanese writes the circumfix and no prenominal どの', () => {
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('SOMETHING'),
    }), 'ja')).toBe('猫は何も食べません。');
    // A `no` **noun** still takes its どの, which is what the circumfix is built from.
    expect(say(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE', { definiteness: 'no' }),
    }), 'ja')).toBe('猫はどのネズミも食べません。');
  });
});

describe('the words', () => {
  test('SOMETHING is glossed on THING', () => {
    expect(definitionAll('SOMETHING')).toEqual({
      en: 'an unknown thing.', it: 'una cosa sconosciuta.', fr: 'une chose inconnue.',
      de: 'ein unbekanntes Ding.', es: 'una cosa desconocida.', ja: '不明なもの。', pt: 'uma coisa desconhecida.',
    });
  });

  // ONLY stays on the literal: "and nothing more" wants a verbless "and" fragment, and a verbless
  // period cannot be negated at all — the negative pronoun alone renders as its positive half.
  // "In a sole way" says *uniquely*, which B67 already refused (see the ticket).
  test('ONLY has no gloss', () => {
    expect(seed('ONLY')?.definition).toBeUndefined();
  });

  // It is a pronoun of a kind the chooser's person row has no place for, so it names its slot and
  // the row skips it — without which it would take the 3rd person's, being the first such concept
  // by id.
  test('SOMETHING names the slot it fills', () => {
    expect(seed('SOMETHING')?.slot).toBe('indefinite');
    expect(seed('THIRD_PERSON')?.slot).toBeUndefined();
  });
});

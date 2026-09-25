import { describe, expect, test } from 'vitest';
import type { LanguageCode, PronominalPossessor, ReadyLanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization C37: OWN, the adjective bound to a possessor. The plan carries a flag rather than an
// adjective id, because the word exists only beside a possessor; the translator hands it to the
// engines as the first adjective, so it agrees and declines by the ordinary machinery. Japanese is
// what the flag is for: 自分の replaces the possessive pronoun instead of joining it.

const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };

function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

describe('OWN beside a possessive pronoun', () => {
  test('the seven renderings, and the Japanese one that replaces the possessor', () => {
    expect(sayAll(clause(np('CAT', { possessor: his, possessorOwn: true }), 'RUN'))).toEqual({
      en: 'his own cat runs.', it: 'il suo proprio gatto corre.', fr: 'son propre chat court.',
      de: 'sein eigener Kater läuft.', es: 'su propio gato corre.', ja: '自分の猫は走ります。',
      pt: 'o seu próprio gato corre.',
    });
    // 彼の自分の猫 is not Japanese: the possessive is gone, and 自分の is the whole of it.
    expect(say(clause(np('CAT', { possessor: his }), 'RUN'), 'ja')).toBe('彼の猫は走ります。');
  });

  test('it declines and agrees with the head, not with the possessor', () => {
    expect(sayAll(clause(np('HOUSE', { possessor: my, possessorOwn: true }), 'RUN'))).toMatchObject({
      it: 'la mia propria casa corre.', fr: 'ma propre maison court.', es: 'mi propia casa corre.',
      pt: 'a minha própria casa corre.', de: 'mein eigenes Haus läuft.',
    });
    expect(sayAll(clause(np('CAT', { number: 'plural', possessor: my, possessorOwn: true }), 'RUN'))).toMatchObject({
      it: 'i miei propri gatti corrono.', fr: 'mes propres chats courent.', de: 'meine eigenen Kater laufen.',
    });
    // German declines it for the case the slot gives, as any attributive adjective does.
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('DOG', { possessor: his, possessorOwn: true }) }), 'de'))
      .toBe('der Kater sieht seinen eigenen Hund.');
    expect(say(clause(np('CAT'), 'LIVE', {
      complements: { locative: { phrase: np('HOUSE', { possessor: his, possessorOwn: true }) } },
    }), 'de')).toBe('der Kater wohnt in seinem eigenen Haus.');
  });

  test('it leads the phrase\'s own adjectives', () => {
    expect(sayAll(clause(np('CAT', { possessor: my, possessorOwn: true, adjectives: ['BIG'] }), 'RUN'))).toMatchObject({
      en: 'my own big cat runs.', de: 'mein eigener großer Kater läuft.', fr: 'mon propre grand chat court.',
      ja: '自分の大きい猫は走ります。',
    });
  });
});

describe('OWN beside a genitive possessor', () => {
  test('the possessor is still said, and Japanese says 自身の instead', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('CAT'), possessorOwn: true }), 'RUN'))).toEqual({
      en: "the cat's own book runs.", it: 'il proprio libro del gatto corre.',
      fr: 'le propre livre du chat court.', de: 'das eigene Buch des Katers läuft.',
      es: 'el propio libro del gato corre.', ja: '猫自身の本は走ります。', pt: 'o próprio livro do gato corre.',
    });
  });
});

describe('the flag and the word', () => {
  test('with no possessor there is nothing to bind it to, so it is ignored', () => {
    expect(sayAll(clause(np('CAT', { possessorOwn: true }), 'RUN'))).toEqual(sayAll(clause(np('CAT'), 'RUN')));
  });

  // It exists only beside a possessor, so it names its slot and the adjective picker skips it —
  // "an own cat" is not a phrase in any of the seven.
  test('OWN_ADJECTIVE names the slot it fills', () => {
    expect(concepts.find((c) => c.id === 'OWN_ADJECTIVE')?.slot).toBe('possessorOwn');
    expect(concepts.find((c) => c.id === 'BIG')?.slot).toBeUndefined();
  });

  test('OWN_ADJECTIVE is glossed by what "my own" adds to "my"', () => {
    expect(definitionAll('OWN_ADJECTIVE')).toEqual({
      en: 'that no other person owns.', it: "che nessun'altra persona possiede.",
      fr: "qu'aucune autre personne ne possède.", de: 'den keine andere Person besitzt.',
      es: 'que ninguna otra persona posee.', ja: 'どの別の人も所有しない。', pt: 'que nenhuma outra pessoa possui.',
    });
  });
});

import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A155. French puts "bien" before the non-finite verb it modifies: between the auxiliary and the
// participle ("a bien mangé") and before an infinitive ("doit bien manger", "est en train de bien
// manger"). The engine trails it after the non-finite verb, where a -ment adverb goes. After a finite
// verb it is already right ("mange bien la souris").
describe('known bugs: French "bien" before the participle and the infinitive', () => {
  const catEatsMouseWell = (verbPhrase: Partial<VerbPhrase> = {}) => sayAll(clause(np('CAT'), 'EAT', {
    directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', ...verbPhrase },
  })).fr;

  test.fails('between the auxiliary and the participle', () => {
    expect(catEatsMouseWell({ aspect: 'resultative' })).toBe('le chat a bien mangé la souris.');
    expect(catEatsMouseWell({ aspect: 'resultative', negative: true })).toBe("le chat n'a pas bien mangé la souris.");
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', modifier: 'WELL', aspect: 'resultative' }, directObject: np('MOUSE') },
    }), 'RUN')).fr).toBe('le chien qui a bien mangé la souris court.');
  });

  test.fails('before the infinitive', () => {
    expect(catEatsMouseWell({ modals: ['MUST'] })).toBe('le chat doit bien manger la souris.');
    expect(catEatsMouseWell({ aspect: 'progressive' })).toBe('le chat est en train de bien manger la souris.');
    expect(catEatsMouseWell({ aspect: 'prospective' })).toBe('le chat est sur le point de bien manger la souris.');
    expect(sayAll(clause(np('BOOK', { number: 'plural' }), 'NAME', {
      directObject: np('BLADE', { adjectives: ['BROWN'] }),
      verbPhrase: { modifier: 'WELL', aspect: 'prospective', tense: 'future' },
    })).fr).toBe('les livres seront sur le point de bien nommer la lame brune.');
  });

  test.fails('…and at the head of an infinitive clause', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL' } }),
      imperative: true, imperativeRegister: 'instruction',
    }).fr).toBe('bien manger la souris.');
  });

  test('regression: after a finite verb it is already right', () => {
    expect(catEatsMouseWell()).toBe('le chat mange bien la souris.');
  });
});

// A156. English puts the main verb's adverb at the very end of the clause, after the complements. A
// manner adverb can stand there ("runs in the house fast"), but UP and DOWN are particles of the verb
// and follow the verb or its object directly: "moves the book up in the house", "jumps down from the
// wall". A142 is the Romance and German side of the same missing distinction.
describe('known bugs: English adverb of direction after the complements', () => {
  test.fails('UP and DOWN come before the complements', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat moves the book up in the house.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'DOWN' }, complements: { cause: { phrase: np('DOG') } },
    })).en).toBe('the cat moves the book down because of the dog.');
    expect(sayAll(clause(np('CAT'), 'JUMP', {
      verbPhrase: { modifier: 'DOWN' }, complements: { source: { phrase: np('WALL') } },
    })).en).toBe('the cat jumps down from the wall.');
    expect(sayAll(clause(np('PERSON', { gender: 'fem', definiteness: 'no', adjectives: ['LOW', 'BAD'] }), 'BITE', {
      directObject: np('AFRICA', { definiteness: 'this' }),
      verbPhrase: { tense: 'past', aspect: 'resultative', modifier: 'DOWN', modals: ['CAN'] },
      complements: { locative: { phrase: np('WOMAN', { gender: 'fem', definiteness: 'some' }) } },
    })).en).toBe('no low bad person could have bitten Africa down in some women.');
  });

  test('regression: with no complement it already follows the object, and Japanese is right', () => {
    const plan = clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    });
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP' } })).en)
      .toBe('the cat moves the book up.');
    expect(sayAll(plan).ja).toBe('猫は家で本を上に移動します。');
  });
});

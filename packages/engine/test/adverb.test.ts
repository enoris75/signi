import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A155. French puts "bien" before the non-finite verb it modifies: between the auxiliary and the
// participle ("a bien mangé") and before an infinitive ("doit bien manger", "est en train de bien
// manger"). The engine trails it after the non-finite verb, where a -ment adverb goes. After a finite
// verb it is already right ("mange bien la souris").
describe('known bugs: French "bien" before the participle and the infinitive', () => {
  const catEatsMouseWell = (verbPhrase: Partial<VerbPhrase> = {}, object = np('MOUSE')) => sayAll(clause(np('CAT'), 'EAT', {
    directObject: object, verbPhrase: { modifier: 'WELL', ...verbPhrase },
  })).fr;

  test('between the auxiliary and the participle', () => {
    expect(catEatsMouseWell({ aspect: 'resultative' })).toBe('le chat a bien mangé la souris.');
    expect(catEatsMouseWell({ aspect: 'resultative', negative: true })).toBe("le chat n'a pas bien mangé la souris.");
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', modifier: 'WELL', aspect: 'resultative' }, directObject: np('MOUSE') },
    }), 'RUN')).fr).toBe('le chien qui a bien mangé la souris court.');
  });

  test('before the infinitive', () => {
    expect(catEatsMouseWell({ modals: ['MUST'] })).toBe('le chat doit bien manger la souris.');
    expect(catEatsMouseWell({ aspect: 'progressive' })).toBe('le chat est en train de bien manger la souris.');
    expect(catEatsMouseWell({ aspect: 'prospective' })).toBe('le chat est sur le point de bien manger la souris.');
    expect(sayAll(clause(np('BOOK', { number: 'plural' }), 'NAME', {
      directObject: np('BLADE', { adjectives: ['BROWN'] }),
      verbPhrase: { modifier: 'WELL', aspect: 'prospective', tense: 'future' },
    })).fr).toBe('les livres seront sur le point de bien nommer la lame brune.');
  });

  test('…and at the head of an infinitive clause', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL' } }),
      imperative: true, imperativeRegister: 'instruction',
    }).fr).toBe('bien manger la souris.');
  });

  // The generalisation: the slot is right before the non-finite verb, so the object clitic follows
  // "bien" and the periphrasis's "de" precedes it, and both auxiliaries take it the same way.
  test('…ahead of an object clitic, and after "avoir" / "être"', () => {
    expect(catEatsMouseWell({ aspect: 'progressive' }, np('THIRD_PERSON')))
      .toBe('le chat est en train de bien le manger.');
    expect(catEatsMouseWell({ modals: ['MUST'] }, np('THIRD_PERSON'))).toBe('le chat doit bien le manger.');
    expect(catEatsMouseWell({ modals: ['MUST'], aspect: 'resultative' })).toBe('le chat doit avoir bien mangé la souris.');
    expect(sayAll(clause(np('CAT'), 'GO', { verbPhrase: { modifier: 'WELL', aspect: 'resultative' } })).fr)
      .toBe('le chat est bien allé.');
  });

  test('…and behind the "ne pas" of a negated infinitive clause', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', negative: true } }),
      imperative: true, imperativeRegister: 'instruction',
    }).fr).toBe('ne pas bien manger la souris.');
  });

  test('regression: after a finite verb it is already right', () => {
    expect(catEatsMouseWell()).toBe('le chat mange bien la souris.');
    expect(catEatsMouseWell({ negative: true })).toBe('le chat ne mange pas bien la souris.');
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL' } }),
      imperative: true,
    }).fr).toBe('mange bien la souris.');
  });

  // A long -ment adverb is unmarked and keeps its place after the participle, and the other six
  // languages never read the flag.
  test('regression: a -ment adverb still follows the participle, and the other six are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE'), verbPhrase: { modifier: 'SLOWLY', aspect: 'resultative' },
    })).fr).toBe('le chat a mangé lentement la souris.');
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', aspect: 'resultative' },
    }))).toMatchObject({
      en: 'the cat has eaten the mouse well.',
      it: 'il gatto ha mangiato bene il topo.',
      es: 'el gato ha comido bien el ratón.',
      pt: 'o gato comeu bem o rato.',
      de: 'der Kater hat gut die Maus gefressen.',
    });
  });
});

// A156. English puts the main verb's adverb at the very end of the clause, after the complements. A
// manner adverb can stand there ("runs in the house fast"), but UP and DOWN are particles of the verb
// and follow the verb or its object directly: "moves the book up in the house", "jumps down from the
// wall". A142 is the Romance and German side of the same missing distinction.
describe('known bugs: English adverb of direction after the complements', () => {
  test('UP and DOWN come before the complements', () => {
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

  // The generalisation: the slot is right after the object, so it holds under a modal, in the
  // periphrastic aspects and in a relative clause, and it takes a pronoun object with it.
  test('…under a modal, in the prospective, and in a relative clause', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP', modals: ['MUST'] }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat must move the book up in the house.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP', aspect: 'prospective' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat is about to move the book up in the house.');
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'MOVE', modifier: 'DOWN' }, directObject: np('BOOK'), complements: { locative: { phrase: np('HOUSE') } } },
    }), 'RUN')).en).toBe('the cat that moves the book down in the house runs.');
  });

  test('…and after a pronoun object', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('THIRD_PERSON', { gender: 'masc' }), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat moves him up in the house.');
  });

  // Regression: a manner adverb still takes the clause's edge, behind the complements.
  test('regression: a manner adverb still trails the complements', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { modifier: 'FAST' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat runs in the house fast.');
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

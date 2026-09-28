import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { lexicon } from '../translator.fixtures.js';
import { planSlots, roleSpans, spansOf } from './roleSpans.js';

// A slot's marks, as `marked` writes them: U+E000 + i before its word, U+E100 + i after.
const open = (i: number) => String.fromCharCode(0xe000 + i);
const close = (i: number) => String.fromCharCode(0xe100 + i);
const mark = (word: string, i: number) => open(i) + word + close(i);

describe('planSlots', () => {
  test("the top clause's roles, by their place in the plan", () => {
    const plan: PhrasePlan = {
      subject: { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' },
      verbPhrase: { verb: 'EAT', modals: ['WANT'], modifier: 'OFTEN', modifiers: ['FAST'] },
      directObject: { concept: 'FOOD' },
      complements: { locative: { phrase: { concept: 'HOUSE' } } },
      address: { concept: 'MOTHER' },
      interjection: 'HEY',
    };
    expect(planSlots(plan)).toEqual([
      { slot: 'subject', concept: 'CAT' },
      { slot: 'verb', concept: 'EAT' },
      { slot: 'modifier.0', concept: 'OFTEN' },
      { slot: 'modifier.1', concept: 'FAST' },
      { slot: 'modal.0', concept: 'WANT' },
      { slot: 'directObject', concept: 'FOOD' },
      { slot: 'locative', concept: 'HOUSE' },
      { slot: 'address', concept: 'MOTHER' },
      { slot: 'interjection', concept: 'HEY' },
    ]);
  });

  test('a word the plan names twice has no slot, nor a subject the sentence drops', () => {
    expect(planSlots({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'SEE' }, directObject: { concept: 'CAT' } }))
      .toEqual([{ slot: 'verb', concept: 'SEE' }]);
    expect(planSlots({ subject: { concept: 'YOU' }, verbPhrase: { verb: 'RUN' }, imperative: true }))
      .toEqual([{ slot: 'verb', concept: 'RUN' }]);
  });
});

describe('spansOf', () => {
  test('marks the sentence kept whole are read off as they stand', () => {
    expect(spansOf(`the ${mark('cats', 0)} ${mark('ate', 1)}.`, 'the cats ate.', true, ['subject', 'verb'])).toEqual([
      { slot: 'subject', start: 4, end: 8 },
      { slot: 'verb', start: 9, end: 12 },
    ]);
  });

  test('an ending added after the mark, or a close cut off with one, grows the span to its word', () => {
    expect(spansOf(`the ${mark('cat', 0)}s.`, 'the cats.', true, ['subject'])).toEqual([{ slot: 'subject', start: 4, end: 8 }]);
    expect(spansOf(`i ${open(0)}mangiarono.`, 'i mangiarono.', true, ['verb'])).toEqual([{ slot: 'verb', start: 2, end: 12 }]);
  });

  test('a rule the mark misled is lined up against the real sentence: "a apple" is "an apple"', () => {
    expect(spansOf(`a ${mark('apple', 0)}.`, 'an apple.', true, ['directObject'])).toEqual([{ slot: 'directObject', start: 3, end: 8 }]);
    expect(spansOf(`le ${mark('oiseau', 0)}.`, "l'oiseau.", true, ['directObject'])).toEqual([{ slot: 'directObject', start: 2, end: 8 }]);
  });

  test('a word said in two places is two spans of its slot', () => {
    const text = 'der Kater fügt das Essen hinzu.';
    expect(spansOf(`der Kater ${mark('fügt', 0)} das Essen ${mark('hinzu', 0)}.`, text, true, ['verb'])).toEqual([
      { slot: 'verb', start: 10, end: 14 },
      { slot: 'verb', start: 25, end: 30 },
    ]);
  });

  test('without spaces between words, a word whose end was rewritten is dropped', () => {
    expect(spansOf(`${mark('猫', 0)}は${mark('食べます', 1)}した。`, '猫は食べました。', false, ['subject', 'verb']))
      .toEqual([{ slot: 'subject', start: 0, end: 1 }]);
    expect(spansOf(`${mark('猫', 0)}は${open(1)}食べました。`, '猫は食べました。', false, ['subject', 'verb']))
      .toEqual([{ slot: 'subject', start: 0, end: 1 }]);
  });
});

describe('roleSpans', () => {
  const LOOKUP = lexicon({ CAT: { base: 'cat', plural: 'cats', gender: 'masc' } });
  const plan: PhrasePlan = { subject: { concept: 'CAT' } };

  test('marks only the surface forms, never a fact about the word', () => {
    let seen: Record<string, string> = {};
    roleSpans(plan, LOOKUP, (lookup) => {
      seen = lookup('CAT', 'en')!.forms;
      return 'the cat';
    }, 'the cat', true);
    expect(seen).toEqual({ base: mark('cat', 0), plural: mark('cats', 0), gender: 'masc' });
  });

  test('a render the marks break costs the spans, never the translation', () => {
    expect(roleSpans(plan, LOOKUP, () => {
      throw new Error('a form it parses');
    }, 'the cat.', true)).toBeUndefined();
  });
});

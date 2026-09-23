import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import { applyIntensifier } from './applyIntensifier.js';

const LEX: Record<string, Record<string, Record<string, string>>> = {
  VERY: {
    en: { base: 'very', comparative: 'much', equative: 'just as', attributive_drop_degrees: 'equally' },
    ja: { base: 'とても', comparative: 'ずっと', comparative_degrees: 'more', drop_degrees: 'equally' },
    it: { base: 'molto' },
  },
  TOO: {
    en: { base: 'too', comparative: 'too much' },
    pt: { base: 'demais', position: 'post', comparative: 'demasiado', comparative_position: 'pre' },
    ja: { base: 'すぎる', position: 'suffix', reading: 'すぎる', comparative: 'すぎる', comparative_degrees: 'more' },
  },
  MUTE: { en: {} },
};
const lookup = (id: string, language: string) => {
  const forms = LEX[id]?.[language];
  return forms ? { conceptId: id, language: language as LanguageCode, forms } : undefined;
};
const adj = (degree?: string): ConceptForms =>
  ({ conceptId: 'BIG', forms: { base: 'big', role: 'adjective', ...(degree ? { degree } : {}) } });

describe('applyIntensifier', () => {
  test('the word and its default position land on the adjective', () => {
    const a = adj();
    applyIntensifier(a, 'VERY', 'en', lookup);
    expect(a.forms['intensifier']).toBe('very');
    expect(a.forms['intensifier_position']).toBe('pre');
  });

  test('the lexeme names a position of its own', () => {
    const a = adj();
    applyIntensifier(a, 'TOO', 'pt', lookup);
    expect(a.forms['intensifier_position']).toBe('post');
    const b = adj();
    applyIntensifier(b, 'TOO', 'ja', lookup);
    expect(b.forms['intensifier_position']).toBe('suffix');
    expect(b.forms['intensifier_reading']).toBe('すぎる');
  });

  test('no id, and a word with no surface, leave the adjective as it was', () => {
    const a = adj();
    applyIntensifier(a, undefined, 'en', lookup);
    applyIntensifier(a, 'MUTE', 'en', lookup);
    applyIntensifier(a, 'ABSENT', 'en', lookup);
    expect(a.forms).toEqual({ base: 'big', role: 'adjective' });
  });

  // A248: a comparative takes the word the lexeme names for it ("much bigger", ずっと大きい).
  test('a comparative degree takes the lexeme\'s comparative word', () => {
    for (const degree of ['more', 'less']) {
      const a = adj(degree);
      applyIntensifier(a, 'VERY', 'en', lookup);
      expect(a.forms['intensifier']).toBe('much');
      expect(a.forms['intensifier_comparative']).toBe('1');
    }
    const positive = adj();
    applyIntensifier(positive, 'VERY', 'en', lookup);
    expect(positive.forms['intensifier']).toBe('very');
    expect(positive.forms['intensifier_comparative']).toBeUndefined();
    const most = adj('most');
    applyIntensifier(most, 'VERY', 'en', lookup);
    expect(most.forms['intensifier']).toBe('very');
  });

  test('a lexeme with no comparative word keeps its base, and one may narrow the degrees', () => {
    const it = adj('more');
    applyIntensifier(it, 'VERY', 'it', lookup);
    expect(it.forms['intensifier']).toBe('molto');
    expect(it.forms['intensifier_comparative']).toBeUndefined();
    const more = adj('more');
    applyIntensifier(more, 'VERY', 'ja', lookup);
    expect(more.forms['intensifier']).toBe('ずっと');
    const less = adj('less');
    applyIntensifier(less, 'VERY', 'ja', lookup);
    expect(less.forms['intensifier']).toBe('とても');
  });

  // A255: the equative takes the lexeme's equative word, which replaces the degree's own adverb.
  test('an equative degree takes the lexeme\'s equative word', () => {
    const a = adj('equally');
    applyIntensifier(a, 'VERY', 'en', lookup);
    expect(a.forms['intensifier']).toBe('just as');
    expect(a.forms['intensifier_equative']).toBe('1');
    expect(a.forms['intensifier_comparative']).toBeUndefined();
    const it = adj('equally');
    applyIntensifier(it, 'VERY', 'it', lookup);
    expect(it.forms['intensifier']).toBe('molto');
    expect(it.forms['intensifier_equative']).toBeUndefined();
  });

  test('a degree the lexeme drops, everywhere or before a noun, gets no intensifier', () => {
    const ja = adj('equally');
    applyIntensifier(ja, 'VERY', 'ja', lookup);
    expect(ja.forms).toEqual({ base: 'big', role: 'adjective', degree: 'equally' });
    const attributive = adj('equally');
    applyIntensifier(attributive, 'VERY', 'en', lookup, true);
    expect(attributive.forms['intensifier']).toBeUndefined();
    const more = adj('more');
    applyIntensifier(more, 'VERY', 'en', lookup, true);
    expect(more.forms['intensifier']).toBe('much');
  });

  // A256: a degree word may name a position of its own, and a suffix keeps its place.
  test('a comparative word takes its own position, falling back to the lexeme\'s', () => {
    const pt = adj('more');
    applyIntensifier(pt, 'TOO', 'pt', lookup);
    expect(pt.forms['intensifier']).toBe('demasiado');
    expect(pt.forms['intensifier_position']).toBe('pre');
    const positive = adj();
    applyIntensifier(positive, 'TOO', 'pt', lookup);
    expect(positive.forms['intensifier_position']).toBe('post');
    const ja = adj('more');
    applyIntensifier(ja, 'TOO', 'ja', lookup);
    expect(ja.forms['intensifier_position']).toBe('suffix');
    expect(ja.forms['intensifier_comparative']).toBe('1');
    const en = adj('less');
    applyIntensifier(en, 'TOO', 'en', lookup);
    expect(en.forms['intensifier']).toBe('too much');
  });
});

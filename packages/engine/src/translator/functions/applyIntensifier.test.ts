import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import { applyIntensifier } from './applyIntensifier.js';

const LEX: Record<string, Record<string, Record<string, string>>> = {
  VERY: { en: { base: 'very' }, ja: { base: 'とても' } },
  TOO: { en: { base: 'too' }, pt: { base: 'demais', position: 'post' }, ja: { base: 'すぎる', position: 'suffix', reading: 'すぎる' } },
  MUTE: { en: {} },
};
const lookup = (id: string, language: string) => {
  const forms = LEX[id]?.[language];
  return forms ? { conceptId: id, language: language as LanguageCode, forms } : undefined;
};
const adj = (): ConceptForms => ({ conceptId: 'BIG', forms: { base: 'big', role: 'adjective' } });

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
});

import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { temporalBare, temporalPreposition } from './temporalPreposition.js';

const time = (forms: Record<string, string>, definiteness?: string) =>
  complement(np({ base: 'x', ...forms }, definiteness ? { definiteness } : {}));

describe('temporalPreposition', () => {
  test('the noun\'s own word, or the language\'s fallback', () => {
    expect(temporalPreposition(time({ temporal_prep: 'on' }), 'at')).toBe('on');
    expect(temporalPreposition(time({}), 'at')).toBe('at');
  });
});

// Localization B80: MORNING is "la mattina", "ce matin", "this morning" — no adposition.
describe('temporalBare', () => {
  test('a noun that names none is never bare', () => {
    expect(temporalBare(time({}, 'this'))).toBe(false);
  });

  test("'1' is bare under every determiner, the default definite included", () => {
    expect(temporalBare(time({ temporal_bare: '1' }))).toBe(true);
    expect(temporalBare(time({ temporal_bare: '1' }, 'indefinite'))).toBe(true);
  });

  test('a list is bare only under the determiners it names', () => {
    const morning = { temporal_prep: 'in', temporal_bare: 'this,that' };
    expect(temporalBare(time(morning, 'this'))).toBe(true);
    expect(temporalBare(time(morning, 'that'))).toBe(true);
    expect(temporalBare(time(morning))).toBe(false);
    expect(temporalBare(time(morning, 'indefinite'))).toBe(false);
  });
});

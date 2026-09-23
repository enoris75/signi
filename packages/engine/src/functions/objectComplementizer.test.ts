import { describe, expect, test } from 'vitest';
import type { ResolvedPhrase } from '../types.js';
import { objectComplementizer } from './objectComplementizer.js';

const clause = (extra: Partial<ResolvedPhrase> = {}): ResolvedPhrase => ({
  subject: { conjuncts: [], agreement: {} } as unknown as ResolvedPhrase['subject'],
  ...extra,
});

describe('objectComplementizer', () => {
  test('a statement opens on "that"', () => {
    expect(objectComplementizer(clause(), 'that', 'whether')).toBe('that');
  });

  test('an indirect yes/no question opens on "whether"', () => {
    expect(objectComplementizer(clause({ embedded: true }), 'that', 'whether')).toBe('whether');
  });

  test('an indirect wh-question opens on its own word, so on nothing here', () => {
    expect(objectComplementizer(clause({ embedded: true, question: { role: 'directObject', animate: false } }), 'dass', 'ob')).toBe('');
  });
});

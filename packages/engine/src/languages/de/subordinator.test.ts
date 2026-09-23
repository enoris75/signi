import { describe, expect, test } from 'vitest';
import { clause, np, vp } from '../resolved.fixtures.js';
import { subordinator } from './subordinator.js';

const kater = np({ base: 'Kater', gender: 'masc' });
const isst = (tense: 'present' | 'past') => clause(kater, vp({ base: 'essen' }, { tense }));

describe('subordinator', () => {
  test('spells each conjunction', () => {
    expect((['when', 'while', 'because', 'after', 'before'] as const).map((conjunction) =>
      subordinator({ conjunction, clause: isst('present') }))).toEqual(['wenn', 'während', 'weil', 'nachdem', 'bevor']);
  });

  test('a past "when" is "als", the single narrated event', () => {
    expect(subordinator({ conjunction: 'when', clause: isst('past') })).toBe('als');
    expect(subordinator({ conjunction: 'because', clause: isst('past') })).toBe('weil');
  });
});

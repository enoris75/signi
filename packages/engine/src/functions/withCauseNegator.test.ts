import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { withCauseNegator } from './withCauseNegator.js';

const DOG = { base: 'dog' };
const denied = { ...complement(np(DOG)), negative: true };
const plain = complement(np(DOG));

describe('withCauseNegator', () => {
  test('a denied cause takes the negator in front', () => {
    expect(withCauseNegator('because of the dog', 'cause', denied, 'not')).toBe('not because of the dog');
    expect(withCauseNegator('wegen des Hundes', 'cause', denied, 'nicht')).toBe('nicht wegen des Hundes');
  });

  test('a cause that is not denied is untouched', () => {
    expect(withCauseNegator('because of the dog', 'cause', plain, 'not')).toBe('because of the dog');
  });

  test('only the cause reads it, and an empty complement stays empty', () => {
    expect(withCauseNegator('in the house', 'locative', denied, 'not')).toBe('in the house');
    expect(withCauseNegator('', 'cause', denied, 'not')).toBe('');
    expect(withCauseNegator('because of the dog', 'cause', undefined, 'not')).toBe('because of the dog');
  });
});

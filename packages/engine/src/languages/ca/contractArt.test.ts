import { describe, expect, test } from 'vitest';
import { AFRICA, EUROPA, GAT } from './ca.fixtures.js';
import { contractArt } from './contractArt.js';

describe('contractArt', () => {
  test('a common noun always takes the definite article', () => {
    expect(contractArt(GAT, false)).toBe('el');
    expect(contractArt(GAT, true)).toBe('els');
  });

  test('a proper noun takes it only when its lexeme says so', () => {
    expect(contractArt(EUROPA, false)).toBe('');
    expect(contractArt(AFRICA, false)).toBe('la');
  });
});

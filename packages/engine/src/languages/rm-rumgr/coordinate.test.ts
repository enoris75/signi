import { describe, expect, test } from 'vitest';
import { CHAUN, GIAT, UM, group, np } from './rumgr.fixtures.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

describe('coordinate', () => {
  test('commas, then e on the last pair — no euphonic ed before a vowel', () => {
    expect(coordinate(group('and', np(GIAT), np(CHAUN), np(UM)), npText)).toBe("il giat, il chaun e l'um");
  });

  test('u for or', () => {
    expect(coordinate(group('or', np(GIAT), np(CHAUN)), npText)).toBe('il giat u il chaun');
  });
});

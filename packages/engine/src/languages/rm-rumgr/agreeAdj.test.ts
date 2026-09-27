import { describe, expect, test } from 'vitest';
import { GROND, PITSCHEN, VEGL, BASS } from './rumgr.fixtures.js';
import { agreeAdj } from './agreeAdj.js';

describe('agreeAdj', () => {
  test('reads the four stored forms', () => {
    expect(agreeAdj(GROND, 'masc', false)).toBe('grond');
    expect(agreeAdj(GROND, 'fem', false)).toBe('gronda');
    expect(agreeAdj(GROND, 'masc', true)).toBe('gronds');
    expect(agreeAdj(GROND, 'fem', true)).toBe('grondas');
  });

  test('the forms no rule derives come from the lexeme', () => {
    expect(agreeAdj(PITSCHEN, 'fem', false)).toBe('pitschna');
    expect(agreeAdj(VEGL, 'fem', true)).toBe('veglias');
    expect(agreeAdj(BASS, 'masc', true)).toBe('bass');
  });

  test('a form the lexeme lacks falls back on the participle rule', () => {
    expect(agreeAdj({ base: 'salvà' }, 'fem', true)).toBe('salvadas');
    expect(agreeAdj({}, 'fem', false)).toBe('');
  });
});

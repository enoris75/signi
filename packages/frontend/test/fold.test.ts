import { describe, expect, test } from 'vitest';
import { fold } from '@signi/shared';

// What the pickers and the console's completion match on (P04-E18 D1, P03 §3).
describe('fold', () => {
  test('takes accents and case off', () => {
    expect(fold('Già')).toBe('gia');
    expect(fold('cafè')).toBe('cafe');
    expect(fold('ratolí')).toBe('ratoli');
  });

  test("takes Catalan's middle dot out, so col·legi is found by typing collegi", () => {
    expect(fold('col·legi')).toBe('collegi');
    expect(fold('intel·ligent')).toBe(fold('intelligent'));
  });

  test('folds Polish, ł included, so zolw finds żółw (P05 §3)', () => {
    expect(fold('żółw')).toBe('zolw');
    expect(fold('Łódź')).toBe('lodz');
    expect(fold('źdźbło')).toBe('zdzblo');
  });
});

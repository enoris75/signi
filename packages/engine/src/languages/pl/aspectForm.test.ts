import { describe, expect, test } from 'vitest';
import { aspectForm } from './aspectForm.js';
import { JESC, KOCHAC, WIDZIEC } from './pl.fixtures.js';

describe('aspectForm', () => {
  test('reads the aspect asked for', () => {
    expect(aspectForm(JESC, true, 'past_masc')).toBe('zjadł');
    expect(aspectForm(JESC, false, 'past_masc')).toBe('jadł');
    expect(aspectForm(JESC, true, 'base')).toBe('zjeść');
  });

  test('an unpaired verb is imperfective everywhere', () => {
    expect(aspectForm(KOCHAC, true, 'past_masc')).toBe('kochał');
  });

  test('a cell one aspect lacks falls back on the other', () => {
    expect(aspectForm(WIDZIEC, false, '2sg_imperative')).toBe('zobacz');
  });
});

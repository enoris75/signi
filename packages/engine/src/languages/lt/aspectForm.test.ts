import { describe, expect, test } from 'vitest';
import { aspectForm } from './aspectForm.js';
import { MYLETI, VALGYTI } from './lt.fixtures.js';

describe('aspectForm', () => {
  test('reads the aspect asked for', () => {
    expect(aspectForm(VALGYTI, true, '3sg_past')).toBe('suvalgė');
    expect(aspectForm(VALGYTI, false, '3sg_past')).toBe('valgė');
    expect(aspectForm(VALGYTI, true, 'base')).toBe('suvalgyti');
  });

  test('an unpaired verb is imperfective everywhere', () => {
    expect(aspectForm(MYLETI, true, '3sg_past')).toBe('mylėjo');
  });

  test('a cell one aspect lacks falls back on the other', () => {
    expect(aspectForm({ base: 'x', pf_base: 'y', pf_2sg_imperative: 'yk' }, false, '2sg_imperative')).toBe('yk');
  });
});

import { describe, expect, test } from 'vitest';
import { withReflexive } from './withReflexive.js';

describe('withReflexive', () => {
  test('no clitic, no change', () => {
    const group = { finite: 'tschenta', rest: [] };
    expect(withReflexive(group, '')).toBe(group);
  });

  test('a simple tense: the clitic before the finite verb', () => {
    expect(withReflexive({ finite: 'tschenta', rest: [] }, 'sa')).toEqual({ finite: 'sa tschenta', rest: [] });
  });

  test('a periphrasis: the clitic stays with the lexical verb, the group\'s last word', () => {
    expect(withReflexive({ finite: 'è', rest: ['tschentada'] }, 'sa')).toEqual({ finite: 'è', rest: ['sa tschentada'] });
    expect(withReflexive({ finite: 'vegn', rest: ['a', 'tschentar'] }, 'sa')).toEqual({ finite: 'vegn', rest: ['a', 'sa tschentar'] });
    expect(withReflexive({ finite: '', rest: ['tschentar'] }, 'ma')).toEqual({ finite: '', rest: ['ma tschentar'] });
  });

  test('elides onto a vowel-initial verb', () => {
    expect(withReflexive({ finite: 'vegn', rest: ['ad', 'avrir'] }, 'sa').rest).toEqual(['ad', "s'avrir"]);
  });
});

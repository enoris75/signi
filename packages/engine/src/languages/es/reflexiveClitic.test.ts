import { describe, expect, test } from 'vitest';
import { COMER, ELLOS, GATO, IR, NOSOTROS, TU, VOLVERSE, VOSOTROS, YO } from './es.fixtures.js';
import { reflexiveClitic } from './reflexiveClitic.js';

describe('reflexiveClitic', () => {
  test('a non-reflexive verb has none', () => {
    expect(reflexiveClitic(COMER, GATO)).toBe('');
    expect(reflexiveClitic(IR, YO)).toBe('');
    expect(reflexiveClitic({}, YO)).toBe('');
  });

  test('a -se infinitive takes the clitic agreeing with its subject', () => {
    expect(reflexiveClitic(VOLVERSE, YO)).toBe('me');
    expect(reflexiveClitic(VOLVERSE, TU)).toBe('te');
    expect(reflexiveClitic(VOLVERSE, GATO)).toBe('se');
    expect(reflexiveClitic(VOLVERSE, NOSOTROS)).toBe('nos');
    expect(reflexiveClitic(VOLVERSE, VOSOTROS)).toBe('os');
    expect(reflexiveClitic(VOLVERSE, ELLOS)).toBe('se');
  });
});

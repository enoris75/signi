import { describe, expect, test } from 'vitest';
import { esEnclitic } from './esEnclitic.js';

describe('esEnclitic', () => {
  test('an infinitive takes the clitic with no accent', () => {
    expect(esEnclitic('comer', 'lo')).toBe('comerlo');
    expect(esEnclitic('ver', 'me')).toBe('verme');
    expect(esEnclitic('cargar', 'los')).toBe('cargarlos');
  });

  test('a command whose stress lands three syllables from the end takes an accent', () => {
    expect(esEnclitic('come', 'lo')).toBe('cómelo');
    expect(esEnclitic('comamos', 'lo')).toBe('comámoslo');
    expect(esEnclitic('piensa', 'lo')).toBe('piénsalo');
    expect(esEnclitic('cuenta', 'me')).toBe('cuéntame');
  });

  test('a command whose stress stays penultimate takes none, and loses one it no longer needs', () => {
    expect(esEnclitic('comed', 'lo')).toBe('comedlo');
    expect(esEnclitic('ve', 'me')).toBe('veme');
    expect(esEnclitic('ved', 'nos')).toBe('vednos');
    expect(esEnclitic('está', 'te')).toBe('estate');
  });

  // A100: the 1st plural drops -s before nos, the 2nd plural -d before os.
  test('the 1st plural loses its -s before nos and the 2nd plural its -d before os', () => {
    expect(esEnclitic('volvamos', 'nos')).toBe('volvámonos');
    expect(esEnclitic('volved', 'os')).toBe('volveos');
    expect(esEnclitic('vuelve', 'te')).toBe('vuélvete');
    expect(esEnclitic('comamos', 'lo')).toBe('comámoslo');
  });

  test('is a no-op with no clitic', () => {
    expect(esEnclitic('come', '')).toBe('come');
  });
});

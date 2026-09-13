import { describe, expect, test } from 'vitest';
import { itEnclitic } from './itEnclitic.js';

describe('itEnclitic', () => {
  test('an infinitive drops its final -e before the clitic', () => {
    expect(itEnclitic('mangiare', 'lo', 'infinitive')).toBe('mangiarlo');
    expect(itEnclitic('vedere', 'mi', 'infinitive')).toBe('vedermi');
    expect(itEnclitic('dormire', 'ci', 'infinitive')).toBe('dormirci');
    expect(itEnclitic('porre', 'lo', 'infinitive')).toBe('porlo');
  });

  test('a short tu command doubles the clitic consonant, except before gli', () => {
    expect(itEnclitic("da'", 'lo', 'short')).toBe('dallo');
    expect(itEnclitic("fa'", 'mi', 'short')).toBe('fammi');
    expect(itEnclitic("va'", 'ci', 'short')).toBe('vacci');
    expect(itEnclitic("da'", 'gli', 'short')).toBe('dagli');
  });

  test('any other host takes the clitic as it is', () => {
    expect(itEnclitic('mangia', 'lo', 'plain')).toBe('mangialo');
    expect(itEnclitic('mangiate', 'lo', 'plain')).toBe('mangiatelo');
  });

  test('no clitic leaves the host untouched', () => {
    expect(itEnclitic('mangiare', '', 'infinitive')).toBe('mangiare');
    expect(itEnclitic("da'", '', 'short')).toBe("da'");
  });
});

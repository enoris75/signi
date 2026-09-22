import { describe, expect, test } from 'vitest';
import { deSyncopate } from './deSyncopate.js';

describe('deSyncopate', () => {
  test('drops the e of an unstressed -el', () => {
    expect(deSyncopate('dunkel')).toBe('dunkl');
    expect(deSyncopate('edel')).toBe('edl');
    expect(deSyncopate('flexibel')).toBe('flexibl');
  });

  test('leaves a stem with no unstressed -el as it is', () => {
    expect(deSyncopate('klein')).toBe('klein');
    expect(deSyncopate('hell')).toBe('hell');
    expect(deSyncopate('schnell')).toBe('schnell');
    expect(deSyncopate('müde')).toBe('müde');
    // The superlative stem ends in -st, not -el: am dunkelsten.
    expect(deSyncopate('dunkelst')).toBe('dunkelst');
  });

  test('keeps the stressed -lel of parallel', () => {
    expect(deSyncopate('parallel')).toBe('parallel');
  });
});

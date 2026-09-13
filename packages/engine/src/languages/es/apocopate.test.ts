import { describe, expect, test } from 'vitest';
import { apocopate } from './apocopate.js';

describe('apocopate', () => {
  test('primero and tercero lose their -o before a masculine singular noun', () => {
    expect(apocopate('FIRST', 'primero', 'masc', false)).toBe('primer');
    expect(apocopate('THIRD', 'tercero', 'masc', false)).toBe('tercer');
  });

  test('the feminine and the plural keep their ending', () => {
    expect(apocopate('FIRST', 'primera', 'fem', false)).toBe('primera');
    expect(apocopate('FIRST', 'primeros', 'masc', true)).toBe('primeros');
    expect(apocopate('THIRD', 'terceras', 'fem', true)).toBe('terceras');
  });

  test('segundo never shortens', () => {
    expect(apocopate('SECOND', 'segundo', 'masc', false)).toBe('segundo');
  });
});

import { describe, expect, test } from 'vitest';
import { pluralize } from './pluralize.js';

describe('pluralize', () => {
  test('a vowel-final word adds -s', () => {
    expect(pluralize('viejo')).toBe('viejos');
    expect(pluralize('grande')).toBe('grandes');
    expect(pluralize('rápida')).toBe('rápidas');
  });

  test('a -z word turns it into -ces', () => {
    expect(pluralize('feliz')).toBe('felices');
    expect(pluralize('luz')).toBe('luces');
  });

  test('any other consonant adds -es', () => {
    expect(pluralize('débil')).toBe('débiles');
    expect(pluralize('singular')).toBe('singulares');
    expect(pluralize('buey')).toBe('bueyes');
  });

  test('a multi-word form pluralises its last word', () => {
    expect(pluralize('no conectado')).toBe('no conectados');
  });
});

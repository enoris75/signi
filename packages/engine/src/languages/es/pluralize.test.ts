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

  // A99: the extra syllable of -es moves the written accent.
  test('a stressed final vowel before -n or -s loses its accent', () => {
    expect(pluralize('marrón')).toBe('marrones');
    expect(pluralize('alemán')).toBe('alemanes');
    expect(pluralize('inglés')).toBe('ingleses');
  });

  test('an unaccented word in -n or -s gains an accent on its second-to-last syllable', () => {
    expect(pluralize('joven')).toBe('jóvenes');
    expect(pluralize('examen')).toBe('exámenes');
    expect(pluralize('imagen')).toBe('imágenes');
    expect(pluralize('origen')).toBe('orígenes');
    expect(pluralize('resumen')).toBe('resúmenes');
  });

  test('a one-syllable word in -n or -s needs no accent', () => {
    expect(pluralize('gris')).toBe('grises');
    expect(pluralize('pan')).toBe('panes');
  });

  test('a multi-word form pluralises its last word', () => {
    expect(pluralize('muy joven')).toBe('muy jóvenes');
    expect(pluralize('no conectado')).toBe('no conectados');
  });
});

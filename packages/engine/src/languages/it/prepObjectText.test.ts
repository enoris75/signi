import { describe, expect, test } from 'vitest';
import { CASA, IO, LIBRO, LUI, np, OGGETTO, SLOT } from './it.fixtures.js';
import { prepObjectText } from './prepObjectText.js';

describe('prepObjectText', () => {
  test('the preposition fuses with the definite article', () => {
    expect(prepObjectText(np(LIBRO), 'su')).toBe('sul libro');
    expect(prepObjectText(np(SLOT), 'su')).toBe('sullo slot');
    expect(prepObjectText(np(OGGETTO), 'su')).toBe("sull'oggetto");
    expect(prepObjectText(np(CASA, { number: 'plural' }), 'su')).toBe('sulle case');
  });

  test('any other determiner stays after the plain preposition', () => {
    expect(prepObjectText(np(LIBRO, { definiteness: 'indefinite' }), 'su')).toBe('su un libro');
    expect(prepObjectText(np(CASA, { definiteness: 'no' }), 'su')).toBe('su nessuna casa');
  });

  test('a pronoun takes its tonic form, through di after su', () => {
    expect(prepObjectText(np(IO), 'su')).toBe('su di me');
    expect(prepObjectText(np(LUI), 'su')).toBe('su di lui');
    expect(prepObjectText(np(LUI), 'a')).toBe('a lui');
  });
});

import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { CASA, el, group, HOMBRE, MUJER, np, PERRO, GATO, RATON } from './es.fixtures.js';
import { npText } from './npText.js';

const base = (phrase: ResolvedNounPhrase) => phrase.head.forms['base'] ?? '';
const word = (surface: string) => np({ base: surface });

describe('coordinateElement', () => {
  test('a single conjunct renders on its own', () => {
    expect(coordinateElement(el(np(GATO)), npText)).toBe('el gato');
  });

  test('each conjunct is rendered with its own article, joined by y', () => {
    expect(coordinateElement(el(np(GATO), np(CASA, { number: 'plural' })), npText)).toBe('el gato y las casas');
  });

  test('three or more take commas, with the conjunction only before the last', () => {
    expect(coordinateElement(el(np(GATO), np(PERRO), np(RATON)), npText)).toBe('el gato, el perro y el ratón');
    expect(coordinateElement(group('or', np(GATO), np(PERRO), np(RATON)), npText)).toBe('el gato, el perro o el ratón');
  });

  test('y becomes e before an i- or hi- sound, but not before hie-', () => {
    expect(coordinateElement(el(word('español'), word('inglés')), base)).toBe('español e inglés');
    expect(coordinateElement(el(word('padre'), word('hijo')), base)).toBe('padre e hijo');
    expect(coordinateElement(el(word('Francia'), word('Italia')), base)).toBe('Francia e Italia');
    expect(coordinateElement(el(word('agua'), word('hielo')), base)).toBe('agua y hielo');
  });

  test('o becomes u before an o- or ho- sound', () => {
    expect(coordinateElement(group('or', word('siete'), word('ocho')), base)).toBe('siete u ocho');
    expect(coordinateElement(group('or', np(MUJER, { definiteness: 'bare' }), np(HOMBRE, { definiteness: 'bare' })), npText)).toBe('mujer u hombre');
  });

  test('the euphonic form reads the rendered conjunct, article included', () => {
    expect(coordinateElement(group('or', np(MUJER), np(HOMBRE)), npText)).toBe('la mujer o el hombre');
  });

  test('a conjunct that renders empty drops out of the list', () => {
    expect(coordinateElement(el(word('gato'), word(''), word('perro')), base)).toBe('gato y perro');
  });
});

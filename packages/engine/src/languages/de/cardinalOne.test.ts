import { describe, expect, test } from 'vitest';
import { np } from '../resolved.fixtures.js';
import { cardinalOne } from './cardinalOne.js';

const HUND = { base: 'Hund', plural: 'Hunde', gender: 'masc', count: 'singular' };
const WASSER = { base: 'Wasser', gender: 'neut', count: 'singular', uncountable: '1' };

describe('cardinalOne', () => {
  test('a bare phrase counted by one becomes the indefinite, its cardinal dropped', () => {
    const forms = cardinalOne(np(HUND, { definiteness: 'bare', numeral: '1' })).head.forms;
    expect(forms['definiteness']).toBe('indefinite');
    expect(forms['numeral']).toBeUndefined();
  });

  test('its approximator moves in front of the determiner', () => {
    const forms = cardinalOne(np(HUND, { definiteness: 'bare', numeral: '1', approximator: 'etwa ' })).head.forms;
    expect(forms['approximator']).toBeUndefined();
    expect(forms['approximator_det']).toBe('etwa ');
  });

  // A329: a possessive that detaches beside the dropped indefinite leaves it the ein-word slot.
  test('a counted head beside a detached possessive becomes the indefinite too', () => {
    const mine = { possessor: { kind: 'pronominal', person: '1', number: 'singular' } as const };
    const forms = cardinalOne(np(HUND, { definiteness: 'bare', numeral: '1', indefinite_dropped: '1' }, mine)).head.forms;
    expect(forms['definiteness']).toBe('indefinite');
    expect(forms['numeral']).toBeUndefined();
  });

  test('any other phrase is left as it is', () => {
    const cases = [
      np(HUND, { definiteness: 'bare', numeral: '2' }),
      np(HUND, { definiteness: 'definite', numeral: '1' }),
      np(HUND, { definiteness: 'this', numeral: '1' }),
      np(WASSER, { definiteness: 'bare', numeral: '1' }),
      np(HUND, { definiteness: 'bare', numeral: '1' }, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }),
    ];
    for (const phrase of cases) expect(cardinalOne(phrase)).toBe(phrase);
  });
});

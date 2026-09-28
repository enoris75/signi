import { describe, expect, test } from 'vitest';
import { possessivePl } from './possessivePl.js';
import type { Agr } from './pl.types.js';

const F: Agr = { gender: 'fem', plural: false, virile: false, animate: false };
const MA: Agr = { gender: 'masc', plural: false, virile: false, animate: true };
const N: Agr = { gender: 'neut', plural: false, virile: false, animate: false };

describe('possessivePl', () => {
  test('mój / twój / nasz / wasz decline with the head', () => {
    expect(possessivePl({ kind: 'pronominal', person: '1', number: 'singular' }, 'acc', F)).toBe('moją');
    expect(possessivePl({ kind: 'pronominal', person: '2', number: 'singular' }, 'acc', MA)).toBe('twojego');
    expect(possessivePl({ kind: 'pronominal', person: '1', number: 'plural' }, 'nom', N)).toBe('nasze');
    expect(possessivePl({ kind: 'pronominal', person: '2', number: 'plural' }, 'gen', F)).toBe('waszej');
  });

  test('jego / jej / ich do not', () => {
    expect(possessivePl({ kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' }, 'ins', F)).toBe('jego');
    expect(possessivePl({ kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' }, 'gen', F)).toBe('jej');
    expect(possessivePl({ kind: 'pronominal', person: '3', number: 'plural' }, 'nom', N)).toBe('ich');
  });

  test('the subject\'s own is swój, whatever the person', () => {
    expect(possessivePl({ kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' }, 'acc', N, true)).toBe('swoje');
    expect(possessivePl({ kind: 'pronominal', person: '1', number: 'singular' }, 'acc', F, true)).toBe('swoją');
  });
});

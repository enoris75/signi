import type { PronominalPossessor } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import { CASA, GATO, LIBRO, np } from './es.fixtures.js';
import { esPossessiveWord } from './esPossessiveWord.js';

const owner = (person: PronominalPossessor['person'], number: PronominalPossessor['number'] = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });

describe('esPossessiveWord', () => {
  test('is empty without a pronominal possessor', () => {
    expect(esPossessiveWord(np(LIBRO))).toBe('');
    expect(esPossessiveWord(np(LIBRO, {}, { possessor: np(GATO) }))).toBe('');
  });

  test('mi, tu and su agree with the possessed only in number', () => {
    expect(esPossessiveWord(np(LIBRO, {}, { possessor: owner('1') }))).toBe('mi');
    expect(esPossessiveWord(np(CASA, { number: 'plural' }, { possessor: owner('2') }))).toBe('tus');
    expect(esPossessiveWord(np(CASA, {}, { possessor: owner('3') }))).toBe('su');
    expect(esPossessiveWord(np(LIBRO, { number: 'plural' }, { possessor: owner('3', 'plural') }))).toBe('sus');
  });

  test('nuestro and vuestro also agree in gender', () => {
    expect(esPossessiveWord(np(CASA, {}, { possessor: owner('1', 'plural') }))).toBe('nuestra');
    expect(esPossessiveWord(np(LIBRO, { number: 'plural' }, { possessor: owner('1', 'plural') }))).toBe('nuestros');
    expect(esPossessiveWord(np(CASA, { number: 'plural' }, { possessor: owner('2', 'plural') }))).toBe('vuestras');
  });

  test('reads the possessed plural off count when number is absent', () => {
    expect(esPossessiveWord(np(LIBRO, { count: 'plural' }, { possessor: owner('1') }))).toBe('mis');
  });
});

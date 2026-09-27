import { describe, expect, test } from 'vitest';
import { CASA, GAT, np } from './ca.fixtures.js';
import { caPossessiveWord } from './caPossessiveWord.js';

const MY = { kind: 'pronominal', person: '1', number: 'singular' } as const;
const OUR = { kind: 'pronominal', person: '1', number: 'plural' } as const;

describe('caPossessiveWord', () => {
  test('agrees with the possessed head', () => {
    expect(caPossessiveWord(np(GAT, {}, { possessor: MY }))).toBe('meu');
    expect(caPossessiveWord(np(CASA, {}, { possessor: MY }))).toBe('meva');
    expect(caPossessiveWord(np(GAT, { number: 'plural' }, { possessor: MY }))).toBe('meus');
    expect(caPossessiveWord(np(CASA, { number: 'plural' }, { possessor: MY }))).toBe('meves');
    expect(caPossessiveWord(np(CASA, {}, { possessor: OUR }))).toBe('nostra');
  });

  test('is empty without a pronominal possessor', () => {
    expect(caPossessiveWord(np(GAT))).toBe('');
    expect(caPossessiveWord(np(GAT, {}, { possessor: np(GAT) }))).toBe('');
  });
});

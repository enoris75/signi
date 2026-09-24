import { describe, expect, test } from 'vitest';
import { np } from '../languages/resolved.fixtures.js';
import { ownHeadForms, possessedHeadForms } from './possessedHeadForms.js';

const CASA = { base: 'casa', gender: 'fem', definiteness: 'indefinite' };
const GATTO = { base: 'gatto', gender: 'masc' };

describe('possessedHeadForms', () => {
  test('a pronominal possessor fills the determiner slot, so the definiteness gives way', () => {
    const mine = np(CASA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(possessedHeadForms(mine, 'definite')).toEqual({ ...CASA, definiteness: 'definite' });
    expect(possessedHeadForms(mine, 'bare')).toEqual({ ...CASA, definiteness: 'bare' });
    expect(mine.head.forms['definiteness']).toBe('indefinite');
  });

  test('a possessed proper name stops supplying its own article, and keeps its other forms', () => {
    const ASIE = { base: 'Asie', gender: 'fem', proper: '1', isA: 'CONTINENT', takes_article: '1' };
    const yours = np(ASIE, {}, { possessor: { kind: 'pronominal', person: '2', number: 'singular' } });
    expect(possessedHeadForms(yours, 'bare')).toEqual({ base: 'Asie', gender: 'fem', isA: 'CONTINENT', takes_article: '1', definiteness: 'bare' });
    expect(yours.head.forms['proper']).toBe('1');
    const plain = np(ASIE);
    expect(possessedHeadForms(plain, 'bare')['proper']).toBe('1');
  });

  // A329: the possessive has the slot in these forms, so a dropped indefinite's mark goes; the
  // head's own forms (`ownHeadForms`) keep it, and drop only `proper`.
  test('the possessed forms drop a dropped indefinite\'s mark, the own forms keep it', () => {
    const COUNTED = { base: 'casa', gender: 'fem', definiteness: 'bare', indefinite_dropped: '1', numeral: '2', proper: '1' };
    const mine = np(COUNTED, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(possessedHeadForms(mine, 'bare')).toEqual({ base: 'casa', gender: 'fem', definiteness: 'bare', numeral: '2' });
    expect(ownHeadForms(mine)).toEqual({ base: 'casa', gender: 'fem', definiteness: 'bare', indefinite_dropped: '1', numeral: '2' });
  });

  test('a genitive possessor, or none, leaves the forms as they are', () => {
    const cats = np(CASA, {}, { possessor: np(GATTO) });
    expect(possessedHeadForms(cats, 'bare')).toBe(cats.head.forms);
    const plain = np(CASA);
    expect(possessedHeadForms(plain, 'bare')).toBe(plain.head.forms);
  });
});

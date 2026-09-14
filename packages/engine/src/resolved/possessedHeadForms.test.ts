import { describe, expect, test } from 'vitest';
import { np } from '../languages/resolved.fixtures.js';
import { possessedHeadForms } from './possessedHeadForms.js';

const CASA = { base: 'casa', gender: 'fem', definiteness: 'indefinite' };
const GATTO = { base: 'gatto', gender: 'masc' };

describe('possessedHeadForms', () => {
  test('a pronominal possessor fills the determiner slot, so the definiteness gives way', () => {
    const mine = np(CASA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(possessedHeadForms(mine, 'definite')).toEqual({ ...CASA, definiteness: 'definite' });
    expect(possessedHeadForms(mine, 'bare')).toEqual({ ...CASA, definiteness: 'bare' });
    expect(mine.head.forms['definiteness']).toBe('indefinite');
  });

  test('a genitive possessor, or none, leaves the forms as they are', () => {
    const cats = np(CASA, {}, { possessor: np(GATTO) });
    expect(possessedHeadForms(cats, 'bare')).toBe(cats.head.forms);
    const plain = np(CASA);
    expect(possessedHeadForms(plain, 'bare')).toBe(plain.head.forms);
  });
});

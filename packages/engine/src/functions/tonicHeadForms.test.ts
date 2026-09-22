import { describe, expect, test } from 'vitest';
import { np } from '../languages/resolved.fixtures.js';
import { tonicHeadForms } from './tonicHeadForms.js';

describe('tonicHeadForms', () => {
  test('drops the determiner a head builder would fuse in', () => {
    expect(tonicHeadForms(np({ person: '3', base: 'él', disjunctive: 'él' }))['definiteness']).toBe('bare');
    // Whatever the phrase carried: a pronoun never has an article of its own to keep.
    expect(tonicHeadForms(np({ person: '3', base: 'él', definiteness: 'definite' }))['definiteness']).toBe('bare');
  });

  test('marks a personal pronoun animate, and a neuter one not', () => {
    expect(tonicHeadForms(np({ person: '3', base: 'él', gender: 'masc' }))['animate']).toBe('1');
    expect(tonicHeadForms(np({ person: '3', base: 'ella', gender: 'fem' }))['animate']).toBe('1');
    expect(tonicHeadForms(np({ person: '1', base: 'yo' }))['animate']).toBe('1');
    expect(tonicHeadForms(np({ person: '3', base: 'ello', gender: 'neut' }))['animate']).toBe('');
  });

  test('carries the rest of the forms through untouched', () => {
    const f = tonicHeadForms(np({ person: '3', base: 'ellas', gender: 'fem', number: 'plural', disjunctive: 'ellas' }));
    expect(f).toMatchObject({ base: 'ellas', gender: 'fem', number: 'plural', disjunctive: 'ellas' });
  });
});

import { describe, expect, test } from 'vitest';
import type { NounElement } from '@signi/shared';
import { LOOKUP } from '../translator.fixtures.js';
import { resolveNounElement } from './resolveNounElement.js';

describe('resolveNounElement', () => {
  test("a single phrase is one conjunct, agreeing as its own head's forms", () => {
    const element = resolveNounElement({ concept: 'CAT' }, 'it', LOOKUP);
    expect(element.conjuncts.map((c) => c.head.forms['base'])).toEqual(['gatto']);
    expect(element.agreement).toBe(element.conjuncts[0].head.forms);
    expect(element).not.toHaveProperty('conjunction');
  });

  test('a group resolves each conjunct, and the agreement they resolve to together', () => {
    const element = resolveNounElement({ conjuncts: [{ concept: 'CAT' }, { concept: 'HOUSE', number: 'plural' }], conjunction: 'and' }, 'it', LOOKUP);
    expect(element.conjuncts.map((c) => [c.head.forms['base'], c.head.forms['number']])).toEqual([['gatto', 'singular'], ['casa', 'plural']]);
    expect(element.conjunction).toBe('and');
    expect(element.agreement).toEqual({ person: '3', number: 'plural', gender: 'masc' });
  });

  test("the group's plural stays on the group: each conjunct keeps its own number", () => {
    const element = resolveNounElement({ conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' }, 'it', LOOKUP);
    expect(element.conjuncts.map((c) => c.head.forms['number'])).toEqual(['singular', 'singular']);
  });

  test('a group of one conjunct is a single phrase', () => {
    const element = resolveNounElement({ conjuncts: [{ concept: 'CAT' }], conjunction: 'or' }, 'it', LOOKUP);
    expect(element).not.toHaveProperty('conjunction');
    expect(element.agreement).toBe(element.conjuncts[0].head.forms);
  });

  test("the group agrees by the language's own rule", () => {
    const youOrMe: NounElement = { conjuncts: [{ concept: 'YOU' }, { concept: 'I' }], conjunction: 'or' };
    expect(resolveNounElement(youOrMe, 'fr', LOOKUP).agreement['number']).toBe('plural');
    expect(resolveNounElement(youOrMe, 'it', LOOKUP).agreement['number']).toBe('singular');
  });
});

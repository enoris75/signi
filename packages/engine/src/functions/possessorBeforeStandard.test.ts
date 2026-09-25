import { describe, expect, test } from 'vitest';
import { adj, el, np } from '../languages/resolved.fixtures.js';
import { possessorBeforeStandard } from './possessorBeforeStandard.js';

const BIG = adj({ role: 'adjective', base: 'big' }, { degree: 'more', standard: '1' });
const DOG = el(np({ base: 'dog' }));
const WOMAN = np({ base: 'woman' });
const cat = (rest: Parameters<typeof np>[2]) => np({ base: 'cat' }, {}, { adjectives: [BIG], ...rest });

describe('possessorBeforeStandard', () => {
  test('a genitive possessor beside an attributive standard moves ahead of it', () => {
    expect(possessorBeforeStandard(cat({ adjectiveStandard: { index: 0, standard: DOG }, possessor: WOMAN }))).toBe(true);
  });

  test('without a standard, or with a pronominal possessor, nothing moves', () => {
    expect(possessorBeforeStandard(cat({ possessor: WOMAN }))).toBe(false);
    expect(possessorBeforeStandard(cat({ adjectiveStandard: { index: 0, standard: DOG } }))).toBe(false);
    expect(possessorBeforeStandard(cat({
      adjectiveStandard: { index: 0, standard: DOG }, possessor: { kind: 'pronominal', person: '3', number: 'singular' },
    }))).toBe(false);
  });
});

import { describe, expect, test } from 'vitest';
import { questionPossessor } from '../../functions/questionPossessor.js';
import { adj, BIG, BOY, CAT, CHILD, DOG, MAN, np } from './en.fixtures.js';
import { possessivePrefix } from './possessivePrefix.js';

describe('possessivePrefix', () => {
  test('the possessor phrase with ’s and a trailing space', () => {
    expect(possessivePrefix(np(CAT))).toBe("the cat's ");
    expect(possessivePrefix(np(DOG, { definiteness: 'indefinite' }, { adjectives: [adj(BIG)] }))).toBe("a big dog's ");
  });

  test('a plural in -s takes the bare apostrophe, an irregular plural ’s', () => {
    expect(possessivePrefix(np(CAT, { number: 'plural' }))).toBe("the cats' ");
    expect(possessivePrefix(np(CHILD, { number: 'plural' }))).toBe("the children's ");
  });

  test('stacks on the possessor’s own possessor', () => {
    expect(possessivePrefix(np(BOY, {}, { possessor: np(MAN) }))).toBe("the man's boy's ");
    expect(possessivePrefix(np(DOG, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe("my dog's ");
  });
});

describe('possessivePrefix: the possessor question (P09-E14)', () => {
  test('the stand-in is whose, its own genitive', () => {
    expect(possessivePrefix(questionPossessor())).toBe('whose ');
  });
});

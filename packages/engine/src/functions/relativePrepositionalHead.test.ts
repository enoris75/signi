import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { el, np, vp } from '../languages/resolved.fixtures.js';
import { relativePrepositionalHead } from './relativePrepositionalHead.js';

const CLICCARE = { base: 'cliccare', object_prep: 'su' };
const VEDERE = { base: 'vedere' };
const GATTO = { base: 'gatto', gender: 'masc', animate: '1' };
const PULSANTE = { base: 'pulsante', gender: 'masc', definiteness: 'definite' };
const QUALE = { base: 'quale', plural: 'quali', definiteness: 'definite' };

const clicked = (rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'directObject', subject: el(np(GATTO)), verbPhrase: vp(CLICCARE), ...rest });

describe('relativePrepositionalHead', () => {
  // A139: "il pulsante sul quale il gatto clicca" relativises the object on its preposition.
  test("the object of a prepositional verb is a stand-in for the head, with the verb's preposition", () => {
    const gap = relativePrepositionalHead(np(PULSANTE, { number: 'plural' }, { relative: clicked() }), QUALE);
    expect(gap?.prep).toBe('su');
    expect(gap?.head.head.forms).toEqual({ gender: 'masc', number: 'plural', ...QUALE });
    expect(gap?.head.relative).toBeUndefined();
  });

  test('the object of a plain transitive verb takes no preposition', () => {
    expect(relativePrepositionalHead(np(PULSANTE, {}, { relative: clicked({ verbPhrase: vp(VEDERE) }) }), QUALE)).toBeUndefined();
  });

  test('a head in any other role of the verb takes none', () => {
    expect(relativePrepositionalHead(np(GATTO, {}, { relative: clicked({ headRole: 'subject' }) }), QUALE)).toBeUndefined();
    expect(relativePrepositionalHead(np(PULSANTE), QUALE)).toBeUndefined();
  });
});

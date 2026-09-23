import { describe, expect, test } from 'vitest';
import type { ResolvedPhrase } from '../../types.js';
import { questionPossessor } from '../../functions/questionPossessor.js';
import { el, ESSEN, HAUS, KATER, np, vp } from './de.fixtures.js';
import { questionFront } from './questionFront.js';

const phrase = (extra: Partial<ResolvedPhrase>, verb = vp(ESSEN)): ResolvedPhrase => ({ subject: el(np(KATER)), verbPhrase: verb, ...extra });

describe('questionFront', () => {
  test('the word alone for E6\'s gaps, the clause unchanged', () => {
    const where = phrase({ question: { role: 'locative', animate: false } });
    expect(questionFront(where)).toEqual({ word: 'wo', rest: where });
  });

  test('a possessor question inside the object fronts the object phrase and empties its slot (P09-E14)', () => {
    const asked = phrase({
      directObject: el(np(HAUS, {}, { possessor: questionPossessor() })),
      question: { role: 'possessor', possessed: 'directObject', animate: true },
    });
    const front = questionFront(asked);
    expect(front.word).toBe('wessen Haus');
    expect(front.rest.directObject).toBeUndefined();
    // A verb that takes its object with a preposition fronts it with the preposition.
    expect(questionFront({ ...asked, verbPhrase: vp({ ...ESSEN, object_prep: 'von' }) }).word).toBe('von wessen Haus');
  });
});

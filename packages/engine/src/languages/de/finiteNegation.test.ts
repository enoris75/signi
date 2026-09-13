import { describe, expect, test } from 'vitest';
import { concept, el, ESSEN, IMMER, KATZE, MAUS, modal, MUESSEN, NIE, np, vp, WERDEN_VERB } from './de.fixtures.js';
import { finiteNegation } from './finiteNegation.js';

const empty = { beforeAspect: '', beforeAdverb: '', beforePredicative: '', after: '' };
const mouse = el(np(MAUS));
const noMouse = el(np(MAUS, { definiteness: 'no' }));

describe('finiteNegation', () => {
  test('an affirmative clause places no nicht and keeps its object', () => {
    expect(finiteNegation(vp(ESSEN), mouse, false)).toEqual({ nicht: empty, directObject: mouse });
    expect(finiteNegation(vp(ESSEN), noMouse, false)).toEqual({ nicht: empty, directObject: noMouse });
  });

  test('a negated verb trails the objects: "isst die Maus nicht"', () => {
    expect(finiteNegation(vp(ESSEN, { negative: true }), mouse, false)).toEqual({ nicht: { ...empty, after: 'nicht' }, directObject: mouse });
    expect(finiteNegation(vp(ESSEN, { negative: true }), undefined, false)).toEqual({ nicht: { ...empty, after: 'nicht' }, directObject: undefined });
  });

  test('nicht leads an adverb, whoever it belongs to: "isst nicht immer", "muss nicht immer essen"', () => {
    expect(finiteNegation(vp(ESSEN, { negative: true, modifier: concept(IMMER) }), mouse, false).nicht)
      .toEqual({ ...empty, beforeAdverb: 'nicht' });
    expect(finiteNegation(vp(ESSEN, { negative: true, modals: [modal(MUESSEN, IMMER)] }), undefined, false).nicht)
      .toEqual({ ...empty, beforeAdverb: 'nicht' });
  });

  test('nicht leads a predicate complement: "wird nicht müde"', () => {
    expect(finiteNegation(vp(WERDEN_VERB, { negative: true }), undefined, true).nicht).toEqual({ ...empty, beforePredicative: 'nicht' });
  });

  test('nicht leads the whole prospective: "ist nicht im Begriff, immer die Maus zu essen"', () => {
    expect(finiteNegation(vp(ESSEN, { negative: true, aspect: 'prospective', modifier: concept(IMMER) }), mouse, false).nicht)
      .toEqual({ ...empty, beforeAspect: 'nicht' });
  });

  test('a negative adverb on the verb or a modal is the negator: "isst nie", "muss nie essen"', () => {
    expect(finiteNegation(vp(ESSEN, { negative: true, modifier: concept(NIE) }), mouse, false)).toEqual({ nicht: empty, directObject: mouse });
    expect(finiteNegation(vp(ESSEN, { negative: true, modals: [modal(MUESSEN, NIE)] }), undefined, false).nicht).toEqual(empty);
  });

  test('a kein object is the negator and stays kein: "isst keine Maus"', () => {
    expect(finiteNegation(vp(ESSEN, { negative: true }), noMouse, false)).toEqual({ nicht: empty, directObject: noMouse });
    expect(finiteNegation(vp(ESSEN, { negative: true, modifier: concept(IMMER) }), noMouse, false).nicht).toEqual(empty);
  });

  test('under a negative adverb every kein conjunct drops to the indefinite: "isst nie eine Maus"', () => {
    const noCats = el(np(MAUS, { definiteness: 'no' }), np(KATZE, { definiteness: 'no' }));
    const { nicht, directObject } = finiteNegation(vp(ESSEN, { negative: true, modals: [modal(MUESSEN, NIE)] }), noCats, false);
    expect(nicht).toEqual(empty);
    expect(directObject?.conjuncts.map((np) => np.head.forms['definiteness'])).toEqual(['indefinite', 'indefinite']);
  });
});

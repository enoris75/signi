import { describe, expect, test } from 'vitest';
import { concept, el, ESSEN, IMMER, KATZE, MAUS, modal, MUESSEN, NIE, np, vp, WERDEN_VERB } from './de.fixtures.js';
import { finiteNegation } from './finiteNegation.js';

const empty = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };
const mouse = el(np(MAUS));
const noMouse = el(np(MAUS, { definiteness: 'no' }));

describe('finiteNegation', () => {
  test('an affirmative clause places no nicht and keeps its object', () => {
    expect(finiteNegation({ verbPhrase: vp(ESSEN), directObject: mouse }, false)).toEqual({ nicht: empty, directObject: mouse, complements: undefined });
    expect(finiteNegation({ verbPhrase: vp(ESSEN), directObject: noMouse }, false)).toEqual({ nicht: empty, directObject: noMouse, complements: undefined });
  });

  test('a negated verb trails the objects: "isst die Maus nicht"', () => {
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: mouse }, false)).toEqual({ nicht: { ...empty, after: 'nicht' }, directObject: mouse, complements: undefined });
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }) }, false)).toEqual({ nicht: { ...empty, after: 'nicht' }, directObject: undefined, complements: undefined });
  });

  test('nicht leads an adverb, whoever it belongs to: "isst nicht immer", "muss nicht immer essen"', () => {
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modifier: concept(IMMER) }), directObject: mouse }, false).nicht)
      .toEqual({ ...empty, beforeAdverb: 'nicht' });
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modals: [modal(MUESSEN, IMMER)] }) }, false).nicht)
      .toEqual({ ...empty, beforeAdverb: 'nicht' });
  });

  test('nicht leads a predicate complement: "wird nicht müde"', () => {
    expect(finiteNegation({ verbPhrase: vp(WERDEN_VERB, { negative: true }) }, true).nicht).toEqual({ ...empty, beforeComplements: 'nicht' });
  });

  test('nicht leads the whole prospective: "ist nicht im Begriff, immer die Maus zu essen"', () => {
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, aspect: 'prospective', modifier: concept(IMMER) }), directObject: mouse }, false).nicht)
      .toEqual({ ...empty, beforeAspect: 'nicht' });
  });

  test('a negative adverb on the verb or a modal is the negator: "isst nie", "muss nie essen"', () => {
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modifier: concept(NIE) }), directObject: mouse }, false)).toEqual({ nicht: empty, directObject: mouse, complements: undefined });
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modals: [modal(MUESSEN, NIE)] }) }, false).nicht).toEqual(empty);
  });

  test('a kein object is the negator and stays kein: "isst keine Maus"', () => {
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: noMouse }, false)).toEqual({ nicht: empty, directObject: noMouse, complements: undefined });
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modifier: concept(IMMER) }), directObject: noMouse }, false).nicht).toEqual(empty);
  });

  test('under a negative adverb every kein conjunct drops to the indefinite: "isst nie eine Maus"', () => {
    const noCats = el(np(MAUS, { definiteness: 'no' }), np(KATZE, { definiteness: 'no' }));
    const { nicht, directObject } = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modals: [modal(MUESSEN, NIE)] }), directObject: noCats }, false);
    expect(nicht).toEqual(empty);
    expect(directObject?.conjuncts.map((np) => np.head.forms['definiteness'])).toEqual(['indefinite', 'indefinite']);
  });
});

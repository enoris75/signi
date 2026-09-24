import { describe, expect, test } from 'vitest';
import {
  complement, complements, concept, el, ESSEN, EUROPA, GEHEN, HAUS, IMMER, KATZE, KOENNEN, MAUS, modal, MUEDE, MUESSEN, NIE, np, vp,
  WASSER, WERDEN_VERB, WOLLEN,
} from './de.fixtures.js';
import { finiteNegation } from './finiteNegation.js';

const empty = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };
const mouse = el(np(MAUS));
const noMouse = el(np(MAUS, { definiteness: 'no' }));
const aMouse = el(np(MAUS, { definiteness: 'indefinite' }));
const determiners = (el?: { conjuncts: { head: { forms: Record<string, string> } }[] }) =>
  el?.conjuncts.map((c) => c.head.forms['definiteness']);

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

  // A182, the other direction: the verb's own "nicht" is spelled into an indefinite object as
  // "kein", so the slot stays empty and the object comes back `no`.
  test('an indefinite or bare object takes the nicht as kein: "isst keine Maus", "isst kein Wasser"', () => {
    const negated = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: aMouse }, false);
    expect(negated.nicht).toEqual(empty);
    expect(determiners(negated.directObject)).toEqual(['no']);
    const water = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: el(np(WASSER, { definiteness: 'bare' })) }, false);
    expect(water.nicht).toEqual(empty);
    expect(determiners(water.directObject)).toEqual(['no']);
    // The adverb keeps its own slot; only "nicht" goes ("isst schnell keine Maus").
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modifier: concept(IMMER) }), directObject: aMouse }, false).nicht)
      .toEqual(empty);
  });

  // A310: an amount quantifier's object carries the "nicht" on its determiner ("frisst nicht viel
  // Essen"); most and some keep it after the object, an adverb keeps its own slot.
  test('an object counted by many, few or enough takes the nicht ahead of its determiner', () => {
    const nichtDets = (el?: { conjuncts: { head: { forms: Record<string, string> } }[] }) =>
      el?.conjuncts.map((c) => c.head.forms['nicht_det']);
    for (const definiteness of ['many', 'few', 'enough']) {
      const negated = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: el(np(WASSER, { definiteness })) }, false);
      expect(negated.nicht).toEqual(empty);
      expect(nichtDets(negated.directObject)).toEqual(['1']);
    }
    for (const definiteness of ['most', 'some']) {
      const negated = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: el(np(WASSER, { definiteness })) }, false);
      expect(negated.nicht).toEqual({ ...empty, after: 'nicht' });
      expect(nichtDets(negated.directObject)).toEqual([undefined]);
    }
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modifier: concept(IMMER) }), directObject: el(np(WASSER, { definiteness: 'many' })) }, false).nicht)
      .toEqual({ ...empty, beforeAdverb: 'nicht' });
  });

  // The predicate nominal takes it on the same terms (ruled 2026-09-21); a predicate ADJECTIVE is
  // not a nominal "kein" can determine, so it keeps the "nicht" that leads it.
  test('an indefinite predicate nominal takes it too, an adjective does not: "wird keine Katze", "wird nicht müde"', () => {
    const aCat = complements({ predicative: complement(np(KATZE, { definiteness: 'indefinite' })) });
    const nominal = finiteNegation({ verbPhrase: vp(WERDEN_VERB, { negative: true }), complements: aCat }, true);
    expect(nominal.nicht).toEqual(empty);
    expect(determiners(nominal.complements?.['predicative']?.phrase)).toEqual(['no']);
    const tired = complements({ predicative: complement(np(MUEDE)) });
    expect(finiteNegation({ verbPhrase: vp(WERDEN_VERB, { negative: true }), complements: tired }, true).nicht)
      .toEqual({ ...empty, beforeComplements: 'nicht' });
  });

  // A209: the prospective's nominal stands inside the zu-group, where "kein" would negate the
  // infinitive alone, so the "nicht" stays ahead of "im Begriff" and the nominal keeps its determiner.
  test('the prospective keeps its nicht ahead of "im Begriff": "ist nicht im Begriff, eine Maus zu essen"', () => {
    const object = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, aspect: 'prospective' }), directObject: aMouse }, false);
    expect(object).toEqual({ nicht: { ...empty, beforeAspect: 'nicht' }, directObject: aMouse, complements: undefined });
    const aCat = complements({ predicative: complement(np(KATZE, { definiteness: 'indefinite' })) });
    const nominal = finiteNegation({ verbPhrase: vp(WERDEN_VERB, { negative: true, aspect: 'prospective' }), complements: aCat }, true);
    expect(nominal.nicht).toEqual({ ...empty, beforeAspect: 'nicht' });
    expect(determiners(nominal.complements?.['predicative']?.phrase)).toEqual(['indefinite']);
  });

  // A230: a `no` phrase there would keep its "kein" inside the zu-group and swallow the verb's
  // negation, so the "nicht" carries ahead of "im Begriff" and the `no` phrases fall to the indefinite.
  test('the prospective\'s nicht takes a kein phrase\'s negation away: "ist nicht im Begriff, eine Maus in einem Haus zu essen"', () => {
    const inNoHouse = complements({ locative: complement(np(HAUS, { definiteness: 'no' })) });
    const negated = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, aspect: 'prospective' }), directObject: noMouse, complements: inNoHouse }, true);
    expect(negated.nicht).toEqual({ ...empty, beforeAspect: 'nicht' });
    expect(determiners(negated.directObject)).toEqual(['indefinite']);
    expect(determiners(negated.complements?.['locative']?.phrase)).toEqual(['indefinite']);
    const noCat = complements({ predicative: complement(np(KATZE, { definiteness: 'no' })) });
    const nominal = finiteNegation({ verbPhrase: vp(WERDEN_VERB, { negative: true, aspect: 'prospective' }), complements: noCat }, true);
    expect(nominal.nicht).toEqual({ ...empty, beforeAspect: 'nicht' });
    expect(determiners(nominal.complements?.['predicative']?.phrase)).toEqual(['indefinite']);
    // The positive prospective's `no` phrase is its own "about to eat no mouse", and keeps its "kein".
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { aspect: 'prospective' }), directObject: noMouse }, false))
      .toEqual({ nicht: empty, directObject: noMouse, complements: undefined });
  });

  // What "kein" cannot cover keeps "nicht": more than one conjunct and a proper name (the definite
  // object is above). A negative adverb still negates on its own, leaving the plain indefinite.
  test('a coordination and a proper name keep the nicht', () => {
    const mixed = el(np(MAUS, { definiteness: 'indefinite' }), np(KATZE));
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: mixed }, false).nicht)
      .toEqual({ ...empty, after: 'nicht' });
    expect(finiteNegation({ verbPhrase: vp(ESSEN, { negative: true }), directObject: el(np(EUROPA, { definiteness: 'bare' })) }, false).nicht)
      .toEqual({ ...empty, after: 'nicht' });
    const never = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modifier: concept(NIE) }), directObject: aMouse }, false);
    expect(never.nicht).toEqual(empty);
    expect(determiners(never.directObject)).toEqual(['indefinite']);
  });

  test('under a negative adverb every kein conjunct drops to the indefinite: "isst nie eine Maus"', () => {
    const noCats = el(np(MAUS, { definiteness: 'no' }), np(KATZE, { definiteness: 'no' }));
    const { nicht, directObject } = finiteNegation({ verbPhrase: vp(ESSEN, { negative: true, modals: [modal(MUESSEN, NIE)] }), directObject: noCats }, false);
    expect(nicht).toEqual(empty);
    expect(directObject?.conjuncts.map((np) => np.head.forms['definiteness'])).toEqual(['indefinite', 'indefinite']);
  });

  // A03: every denied word of the verb group spells its own "nicht" in the same slot.
  describe('modal polarity', () => {
    const cannot = { ...modal(KOENNEN), negative: true };

    test('the main verb under a modal adds one: "will nicht gehen", "will nicht nicht gehen"', () => {
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { modals: [modal(WOLLEN)], governedNegative: true }) }, false).nicht)
        .toEqual({ ...empty, after: 'nicht' });
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { negative: true, modals: [modal(WOLLEN)], governedNegative: true }) }, false).nicht)
        .toEqual({ ...empty, after: 'nicht nicht' });
    });

    test('an inner modal adds one: "muss nicht gehen können", "muss nicht nicht gehen können"', () => {
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { modals: [modal(MUESSEN), cannot] }) }, false).nicht)
        .toEqual({ ...empty, after: 'nicht' });
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { negative: true, modals: [modal(MUESSEN), cannot] }) }, false).nicht)
        .toEqual({ ...empty, after: 'nicht nicht' });
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { modals: [modal(MUESSEN), cannot], governedNegative: true }) }, false).nicht)
        .toEqual({ ...empty, after: 'nicht nicht' });
    });

    // The outermost modal is the finite element: the translator has already moved its flag to
    // `negative`, so the one on `modals[0]` is not read twice, and `governedNegative` means nothing
    // with no modal to govern (there the main verb IS the finite one).
    test('the outermost modal and a modal-free governed flag count for nothing', () => {
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { modals: [{ ...modal(WOLLEN), negative: true }] }) }, false).nicht).toEqual(empty);
      expect(finiteNegation({ verbPhrase: vp(GEHEN, { governedNegative: true }) }, false).nicht).toEqual(empty);
    });

    test('they take the slot the finite one takes: before an adverb, a complement, the prospective', () => {
      const both = { negative: true, modals: [modal(WOLLEN)], governedNegative: true };
      expect(finiteNegation({ verbPhrase: vp(ESSEN, { ...both, modifier: concept(IMMER) }) }, false).nicht)
        .toEqual({ ...empty, beforeAdverb: 'nicht nicht' });
      expect(finiteNegation({ verbPhrase: vp(WERDEN_VERB, both) }, true).nicht)
        .toEqual({ ...empty, beforeComplements: 'nicht nicht' });
      expect(finiteNegation({ verbPhrase: vp(ESSEN, { ...both, aspect: 'prospective' }) }, false).nicht)
        .toEqual({ ...empty, beforeAspect: 'nicht nicht' });
    });

    // German has no concord, so a governed "nicht" gives way to a "kein" exactly as the finite one
    // does — "der Kater will kein Essen fressen" — and a lone one still absorbs into an indefinite.
    test('a kein object or a nie outranks a governed negation as it does the finite one', () => {
      const governed = { modals: [modal(WOLLEN)], governedNegative: true };
      expect(finiteNegation({ verbPhrase: vp(ESSEN, governed), directObject: noMouse }, false))
        .toEqual({ nicht: empty, directObject: noMouse, complements: undefined });
      expect(finiteNegation({ verbPhrase: vp(ESSEN, { ...governed, modifier: concept(NIE) }), directObject: mouse }, false).nicht)
        .toEqual(empty);
      const absorbed = finiteNegation({ verbPhrase: vp(ESSEN, governed), directObject: aMouse }, false);
      expect(absorbed.nicht).toEqual(empty);
      expect(determiners(absorbed.directObject)).toEqual(['no']);
    });

    // "kein" is "nicht + ein", so it can only ever stand in for ONE "nicht": two denials keep both
    // words and leave the object's determiner alone ("will eine Maus nicht nicht essen").
    test('two negations are not absorbed by an indefinite object', () => {
      const twice = finiteNegation({
        verbPhrase: vp(ESSEN, { negative: true, modals: [modal(WOLLEN)], governedNegative: true }), directObject: aMouse,
      }, false);
      expect(twice.nicht).toEqual({ ...empty, after: 'nicht nicht' });
      expect(determiners(twice.directObject)).toEqual(['indefinite']);
    });
  });
});

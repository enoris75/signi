import { describe, expect, test } from 'vitest';
import { CAN, concept, HE, I, MAY, MUST, SHOULD, THEY, WE, WILL } from './en.fixtures.js';
import { modalFinite } from './modalFinite.js';

describe('modalFinite', () => {
  test('affirmative: the modal conjugated for tense and subject', () => {
    expect(modalFinite(concept(MUST), HE, 'present', false)).toBe('must');
    expect(modalFinite(concept(MUST), HE, 'past', false)).toBe('had to');
    expect(modalFinite(concept(CAN), I, 'past', false)).toBe('could');
    expect(modalFinite(concept(CAN), THEY, 'future', false)).toBe('will be able to');
    expect(modalFinite(concept(WILL), HE, 'present', false)).toBe('wants');
    expect(modalFinite(concept(WILL), I, 'present', false)).toBe('want');
  });

  describe('negative', () => {
    test('a true modal auxiliary takes not straight after itself', () => {
      expect(modalFinite(concept(CAN), HE, 'past', true)).toBe('could not');
    });

    test('can not is written cannot', () => {
      expect(modalFinite(concept(CAN), HE, 'present', true)).toBe('cannot');
      expect(modalFinite(concept(CAN), WE, 'present', true)).toBe('cannot');
    });

    test('a suppletive future negates on its will', () => {
      expect(modalFinite(concept(CAN), I, 'future', true)).toBe('will not be able to');
      expect(modalFinite(concept(MUST), HE, 'future', true)).toBe('will not have to');
      expect(modalFinite(concept(WILL), THEY, 'future', true)).toBe('will not want');
    });

    // Signi scopes a negated MUST as the absence of obligation, in every tense (A23).
    test('must negates as not having to, with do-support', () => {
      expect(modalFinite(concept(MUST), HE, 'present', true)).toBe('does not have to');
      expect(modalFinite(concept(MUST), I, 'present', true)).toBe('do not have to');
      expect(modalFinite(concept(MUST), THEY, 'past', true)).toBe('did not have to');
    });

    test('the lexical want takes do-support over its bare form', () => {
      expect(modalFinite(concept(WILL), HE, 'present', true)).toBe('does not want');
      expect(modalFinite(concept(WILL), WE, 'present', true)).toBe('do not want');
      expect(modalFinite(concept(WILL), HE, 'past', true)).toBe('did not want');
    });
  });

  describe('question', () => {
    test('a true modal auxiliary is the auxiliary a question inverts', () => {
      expect(modalFinite(concept(MUST), HE, 'present', false, true)).toBe('must');
      expect(modalFinite(concept(CAN), I, 'past', false, true)).toBe('could');
      expect(modalFinite(concept(CAN), THEY, 'future', false, true)).toBe('will be able to');
    });

    test('anything else takes do-support over its bare form', () => {
      expect(modalFinite(concept(WILL), HE, 'present', false, true)).toBe('does want');
      expect(modalFinite(concept(WILL), WE, 'present', false, true)).toBe('do want');
      expect(modalFinite(concept(MUST), HE, 'past', false, true)).toBe('did have to');
    });

    test('a negative question is negated as a statement is', () => {
      expect(modalFinite(concept(CAN), HE, 'present', true, true)).toBe('cannot');
      expect(modalFinite(concept(WILL), HE, 'present', true, true)).toBe('does not want');
    });
  });

  // B63: "should" is a modal auxiliary, and the "be" of a suppletive periphrasis behaves as one —
  // never the do-support "does not be supposed to" / "did the cat be allowed to".
  describe('should, and the "be" of a periphrasis', () => {
    test('should takes "not" and leads a question itself', () => {
      expect(modalFinite(concept(SHOULD), HE, 'present', false)).toBe('should');
      expect(modalFinite(concept(SHOULD), HE, 'present', true)).toBe('should not');
      expect(modalFinite(concept(SHOULD), THEY, 'present', false, true)).toBe('should');
    });

    test('a finite "be" negates and inverts on itself, agreeing with the subject', () => {
      expect(modalFinite(concept(MAY), HE, 'past', false)).toBe('was allowed to');
      expect(modalFinite(concept(MAY), THEY, 'past', false)).toBe('were allowed to');
      expect(modalFinite(concept(MAY), HE, 'past', true)).toBe('was not allowed to');
      expect(modalFinite(concept(MAY), HE, 'past', false, true)).toBe('was allowed to');
      expect(modalFinite(concept(MAY), I, 'present', true)).toBe('may not');
    });
  });
});

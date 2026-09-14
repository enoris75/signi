import { describe, expect, it } from 'vitest';
import { resolveAntecedent } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/resolveAntecedent.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BOY, CAT, DOG, EAT, HOUSE, I, WE } from '../fixtures.ts';

describe('resolveAntecedent', () => {
  it('reads a noun as a third-person singular antecedent with no gender', () => {
    const root: PhraseSelection = { subject: BOY, verb: EAT, directObject: CAT };

    expect(resolveAntecedent(root, 'subject')).toEqual({
      concept: BOY,
      features: { kind: 'pronominal', person: '3', number: 'singular' },
    });
  });

  it('takes the number and gender the user set on the antecedent', () => {
    const root: PhraseSelection = { directObject: CAT, directObjectNumber: 'plural', directObjectGender: 'fem' };

    expect(resolveAntecedent(root, 'directObject')?.features).toEqual({
      kind: 'pronominal',
      person: '3',
      number: 'plural',
      gender: 'fem',
    });
  });

  it('takes a pronoun antecedent’s own person and number', () => {
    expect(resolveAntecedent({ subject: I }, 'subject')?.features).toEqual({
      kind: 'pronominal',
      person: '1',
      number: 'singular',
    });
    expect(resolveAntecedent({ subject: WE }, 'subject')?.features).toMatchObject({ person: '1', number: 'plural' });
  });

  it('lets the number set on the slot win over the pronoun’s own', () => {
    expect(resolveAntecedent({ subject: WE, subjectNumber: 'singular' }, 'subject')?.features.number).toBe('singular');
  });

  it('resolves a complement antecedent', () => {
    expect(resolveAntecedent({ locative: HOUSE }, 'locative')?.concept).toBe(HOUSE);
  });

  it('descends into a possessor, whose head is its subject', () => {
    const root: PhraseSelection = {
      directObject: CAT,
      directObjectPossessor: { subject: BOY, subjectGender: 'masc' },
    };

    expect(resolveAntecedent(root, 'directObject/possessor')).toEqual({
      concept: BOY,
      features: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' },
    });
  });

  it('descends into a conjunct by its index', () => {
    const root: PhraseSelection = {
      subject: BOY,
      subjectConjuncts: [{ subject: CAT }, { subject: DOG, subjectNumber: 'plural' }],
    };

    expect(resolveAntecedent(root, 'subject/conjunct/0')?.concept).toBe(CAT);
    expect(resolveAntecedent(root, 'subject/conjunct/1')?.features.number).toBe('plural');
  });

  it('chains steps: a conjunct’s possessor', () => {
    const root: PhraseSelection = {
      subject: BOY,
      subjectConjuncts: [{ subject: CAT, subjectPossessor: { subject: DOG } }],
    };

    expect(resolveAntecedent(root, 'subject/conjunct/0/possessor')?.concept).toBe(DOG);
  });

  it.each<[string, PhraseSelection, string]>([
    ['an empty slot', { subject: BOY }, 'directObject'],
    ['a missing possessor', { subject: BOY }, 'subject/possessor'],
    ['a possessor with no head', { subject: BOY, subjectPossessor: {} }, 'subject/possessor'],
    ['a conjunct past the end', { subject: BOY, subjectConjuncts: [{ subject: CAT }] }, 'subject/conjunct/1'],
    ['a block with no conjuncts', { subject: BOY }, 'subject/conjunct/0'],
    ['an unknown step', { subject: BOY }, 'subject/relative'],
  ])('is undefined for %s', (_, root, address) => {
    expect(resolveAntecedent(root, address)).toBeUndefined();
  });
});

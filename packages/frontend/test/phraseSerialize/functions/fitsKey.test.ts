import { describe, expect, it } from 'vitest';
import { fitsKey } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/fitsKey.ts';

describe('fitsKey', () => {
  it.each<[string, unknown]>([
    ['subject', 'CAT'],
    ['routeAdjective2', 'BIG'],
    ['subjectPossessor', { subject: 'BOY' }],
    ['subjectConjuncts', [{ subject: 'DOG' }]],
    ['subjectConjuncts', []],
    ['modifierAdjectives', { subjectAdjective: 'SEMANTIC' }],
    ['modifierRelations', { subjectAdjective: 'purpose' }],
    ['adjectiveDegrees', {}],
  ])('fits %s with %j', (key, value) => {
    expect(fitsKey(key, value)).toBe(true);
  });

  it.each<[string, unknown]>([
    ['subject', { id: 'CAT' }],
    ['verbModal', 42],
    ['subjectPossessor', 'BOY'],
    ['subjectPossessor', [{ subject: 'BOY' }]],
    ['subjectConjuncts', { subject: 'DOG' }],
    ['subjectConjuncts', 'DOG'],
    ['modifierAdjectives', ['SEMANTIC']],
    ['modifierNumbers', 'plural'],
  ])('does not fit %s with %j', (key, value) => {
    expect(fitsKey(key, value)).toBe(false);
  });

  it.each<[string, unknown]>([
    ['subjectNumber', 'plural'],
    ['verbNegative', 1],
    ['subjectPossessorRef', { to: 'subject' }],
    ['imperativePerson', ['1pl']],
  ])('fits the scalar %s with anything, even %j', (key, value) => {
    expect(fitsKey(key, value)).toBe(true);
  });
});

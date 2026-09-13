import { describe, expect, test } from 'vitest';
import { BON, concept, GRAND, MAUVAIS } from './fr.fixtures.js';
import { frComparison } from './frComparison.js';

describe('frComparison', () => {
  test('a positive adjective is just agreed', () => {
    expect(frComparison(concept(GRAND, 'BIG'), 'fem', false)).toBe('grande');
    expect(frComparison(concept(BON, 'GOOD'), 'fem', true)).toBe('bonnes');
  });

  test('a periphrastic degree prefixes its adverb onto the agreed base', () => {
    expect(frComparison(concept({ ...GRAND, degree: 'more' }, 'BIG'), 'fem', false)).toBe('plus grande');
    expect(frComparison(concept({ ...GRAND, degree: 'most' }, 'BIG'), 'masc', true)).toBe('plus grands');
  });

  test('bon and mauvais suppletise on the raised degrees, and the suppletive agrees', () => {
    expect(frComparison(concept({ ...BON, degree: 'more' }, 'GOOD'), 'masc', false)).toBe('meilleur');
    expect(frComparison(concept({ ...BON, degree: 'more' }, 'GOOD'), 'fem', false)).toBe('meilleure');
    expect(frComparison(concept({ ...BON, degree: 'most' }, 'GOOD'), 'fem', true)).toBe('meilleures');
    expect(frComparison(concept({ ...MAUVAIS, degree: 'more' }, 'BAD'), 'masc', true)).toBe('pires');
  });

  test('the lowered and equal degrees of a suppletive adjective stay periphrastic', () => {
    expect(frComparison(concept({ ...BON, degree: 'less' }, 'GOOD'), 'masc', false)).toBe('moins bon');
    expect(frComparison(concept({ ...BON, degree: 'equally' }, 'GOOD'), 'fem', false)).toBe('aussi bonne');
    expect(frComparison(concept({ ...MAUVAIS, degree: 'least' }, 'BAD'), 'fem', false)).toBe('moins mauvaise');
  });

  test('an adjective with no base yields nothing', () => {
    expect(frComparison(concept({ role: 'adjective', degree: 'more' }), 'masc', false)).toBe('');
  });
});

import { describe, expect, test } from 'vitest';
import { CORRERE, np, vp, type Forms } from './it.fixtures.js';
import { withRelative } from './withRelative.js';

const QUALCUNO: Forms = { base: 'qualcuno', person: '3', number: 'singular', gender: 'masc', indefinite: '1' };

describe('withRelative (it)', () => {
  test('a pronoun without a relative clause is unchanged', () => {
    expect(withRelative('qualcuno', np(QUALCUNO))).toBe('qualcuno');
  });

  test('an indefinite pronoun keeps its relative clause (A309)', () => {
    expect(withRelative('con qualcuno', np(QUALCUNO, {}, { relative: { headRole: 'subject', verbPhrase: vp(CORRERE) } })))
      .toBe('con qualcuno che corre');
  });
});

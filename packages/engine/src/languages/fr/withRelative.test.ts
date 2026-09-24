import { describe, expect, test } from 'vitest';
import { MANGER, np, vp, type Forms } from './fr.fixtures.js';
import { withRelative } from './withRelative.js';

const QUELQUUN: Forms = { base: "quelqu'un", person: '3', number: 'singular', gender: 'masc', indefinite: '1' };

describe('withRelative (fr)', () => {
  test('a pronoun without a relative clause is unchanged', () => {
    expect(withRelative("quelqu'un", np(QUELQUUN))).toBe("quelqu'un");
  });

  test('an indefinite pronoun keeps its relative clause (A309)', () => {
    expect(withRelative("avec quelqu'un", np(QUELQUUN, {}, { relative: { headRole: 'subject', verbPhrase: vp(MANGER) } })))
      .toBe("avec quelqu'un qui mange");
  });
});

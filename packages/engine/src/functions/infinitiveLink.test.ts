import { describe, expect, test } from 'vitest';
import { clause, complement, complements, np, vp } from '../languages/resolved.fixtures.js';
import { infinitiveLink } from './infinitiveLink.js';

const GENERIC = { base: 'si', person: '3', number: 'singular', generic: '1' };

describe('infinitiveLink', () => {
  test("a predicate adjective governs the infinitive, so its lexeme's link is taken (capace di)", () => {
    const able = clause(np(GENERIC), vp({ base: 'essere', copula: '1' }, { mood: 'infinitive' }), {
      complements: complements({ predicative: complement(np({ base: 'capace', role: 'adjective', infinitive_link: 'di' })) }),
    });
    expect(infinitiveLink(able)).toBe('di');
  });

  test("without a predicate the verb governs it (望む takes を)", () => {
    const desire = clause(np(GENERIC), vp({ base: '望む', infinitive_link: 'を' }));
    expect(infinitiveLink(desire)).toBe('を');
  });

  test('is empty for a governor that takes the bare infinitive (desiderare agire)', () => {
    expect(infinitiveLink(clause(np(GENERIC), vp({ base: 'desiderare' })))).toBe('');
  });

  test('is empty for a verbless clause', () => {
    expect(infinitiveLink(clause(np(GENERIC)))).toBe('');
  });
});

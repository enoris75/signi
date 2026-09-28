import { describe, expect, test } from 'vitest';
import type { ResolvedVerbPhrase } from '../../types.js';
import { perfectiveFor } from './perfectiveFor.js';
import { cf } from './pl.fixtures.js';

const vp = (extra: Partial<ResolvedVerbPhrase> = {}): ResolvedVerbPhrase => ({ verb: cf('EAT'), modals: [], ...extra });

describe('perfectiveFor — the aspect-selection table (P05 §0.3)', () => {
  test('present imperfective, neutral past and future perfective', () => {
    expect(perfectiveFor(vp(), 'finite', false)).toBe(false);
    expect(perfectiveFor(vp({ tense: 'past' }), 'finite', false)).toBe(true);
    expect(perfectiveFor(vp({ tense: 'future' }), 'finite', false)).toBe(true);
  });

  test('progressive imperfective in any tense', () => {
    expect(perfectiveFor(vp({ tense: 'future', aspect: 'progressive' }), 'finite', false)).toBe(false);
  });

  test('prospective and resultative perfective', () => {
    expect(perfectiveFor(vp({ aspect: 'prospective' }), 'finite', false)).toBe(true);
    expect(perfectiveFor(vp({ aspect: 'resultative' }), 'finite', false)).toBe(true);
  });

  test('a frequency adverb makes it imperfective', () => {
    expect(perfectiveFor(vp({ tense: 'past', modifier: cf('ALWAYS') }), 'finite', false)).toBe(false);
  });

  test('under a modal: perfective, imperfective when negated', () => {
    expect(perfectiveFor(vp(), 'governed', false)).toBe(true);
    expect(perfectiveFor(vp(), 'governed', true)).toBe(false);
  });

  test('the conditional perfective, a gdyby clause imperfective', () => {
    expect(perfectiveFor(vp({ mood: 'conditional' }), 'finite', false)).toBe(true);
    expect(perfectiveFor(vp({ mood: 'subjunctive', tense: 'past' }), 'finite', false)).toBe(false);
  });

  test('the imperative: perfective, imperfective when negated', () => {
    expect(perfectiveFor(vp({ mood: 'imperative' }), 'finite', false)).toBe(true);
    expect(perfectiveFor(vp({ mood: 'imperative' }), 'finite', true)).toBe(false);
  });

  test('a stative verb is imperfective in the past', () => {
    expect(perfectiveFor(vp({ tense: 'past', verb: cf('HAVE') }), 'finite', false)).toBe(false);
  });
});

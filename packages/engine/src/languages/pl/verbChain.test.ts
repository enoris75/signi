import { describe, expect, test } from 'vitest';
import type { ResolvedVerbPhrase } from '../../types.js';
import { verbChain, type ChainOptions } from './verbChain.js';
import { cf } from './pl.fixtures.js';
import type { VerbAgr } from './pl.types.js';

const HE: VerbAgr = { person: '3', plural: false, gender: 'masc', virile: false };
const SHE: VerbAgr = { person: '3', plural: false, gender: 'fem', virile: false };
const vp = (extra: Partial<ResolvedVerbPhrase> = {}): ResolvedVerbPhrase => ({ verb: cf('EAT'), modals: [], ...extra });
const opts = (extra: Partial<ChainOptions> = {}): ChainOptions => ({
  negation: { finite: false, inner: false }, generic: false, adverb: '', modalAdverb: (m) => m?.forms['base'] ?? '', ...extra,
});
const say = (v: ResolvedVerbPhrase, agr = HE, o: Partial<ChainOptions> = {}) => verbChain(v, agr, opts(o)).join(' ');

describe('verbChain', () => {
  test('the aspect table', () => {
    expect(say(vp())).toBe('je');
    expect(say(vp({ tense: 'past' }))).toBe('zjadł');
    expect(say(vp({ tense: 'future' }))).toBe('zje');
    expect(say(vp({ tense: 'future', aspect: 'progressive' }))).toBe('będzie jadł');
    expect(say(vp({ aspect: 'prospective' }))).toBe('zaraz zje');
    expect(say(vp({ tense: 'past', aspect: 'prospective' }))).toBe('miał zaraz zjeść');
    expect(say(vp({ aspect: 'resultative' }))).toBe('zjadł');
    expect(say(vp({ mood: 'conditional' }))).toBe('zjadłby');
  });

  test('nie before the finite verb', () => {
    expect(say(vp({ tense: 'past', negative: true }), HE, { negation: { finite: true, inner: false } })).toBe('nie zjadł');
  });

  test('modals: the perfective infinitive, imperfective when negated', () => {
    expect(say(vp({ modals: [{ verb: cf('MUST') }] }))).toBe('musi zjeść');
    expect(say(vp({ modals: [{ verb: cf('MUST') }], negative: true }), HE, { negation: { finite: true, inner: false } })).toBe('nie musi jeść');
    expect(say(vp({ verb: cf('GO'), modals: [{ verb: cf('WILL') }, { verb: cf('CAN') }] }))).toBe('chce móc pójść');
    expect(say(vp({ modals: [{ verb: cf('MUST') }], tense: 'past' }), SHE)).toBe('musiała zjeść');
  });

  test('a reflexive verb and the impersonal take się once', () => {
    expect(say(vp({ verb: cf('BECOME') }))).toBe('staje się');
    expect(say(vp({ verb: cf('BECOME'), tense: 'past' }))).toBe('stał się');
    expect(say(vp(), { person: '3', plural: false, gender: 'neut', virile: false }, { generic: true })).toBe('je się');
    expect(say(vp({ tense: 'past' }), { person: '3', plural: false, gender: 'neut', virile: false }, { generic: true })).toBe('zjadło się');
  });

  test('the passive: być + imperfective, zostać + perfective', () => {
    expect(say(vp({ voice: 'passive' }), SHE)).toBe('jest jedzona');
    expect(say(vp({ voice: 'passive', tense: 'past' }), SHE)).toBe('została zjedzona');
    expect(say(vp({ voice: 'passive', tense: 'future' }), SHE)).toBe('zostanie zjedzona');
  });
});

import { describe, expect, test } from 'vitest';
import type { ResolvedVerbPhrase } from '../../types.js';
import { verbChain, type ChainOptions } from './verbChain.js';
import { cf } from './lt.fixtures.js';
import type { VerbAgr } from './lt.types.js';

const SHE: VerbAgr = { person: '3', plural: false, gender: 'fem' };
const HE: VerbAgr = { person: '3', plural: false, gender: 'masc' };
const I: VerbAgr = { person: '1', plural: false, gender: 'masc' };
const vp = (extra: Partial<ResolvedVerbPhrase> = {}): ResolvedVerbPhrase => ({ verb: cf('EAT'), modals: [], ...extra });
const opts = (extra: Partial<ChainOptions> = {}): ChainOptions => ({
  negation: { finite: false, inner: false }, adverb: '', modalAdverb: (m) => m?.forms['base'] ?? '', ...extra,
});
const NEG = { negation: { finite: true, inner: false } };
const say = (v: ResolvedVerbPhrase, agr = SHE, o: Partial<ChainOptions> = {}) => verbChain(v, agr, opts(o)).join(' ');

describe('verbChain', () => {
  test('the aspect table (P18 §0.3)', () => {
    expect(say(vp())).toBe('valgo');
    expect(say(vp({ tense: 'past' }))).toBe('suvalgė');
    expect(say(vp({ tense: 'future' }))).toBe('suvalgys');
    expect(say(vp({ tense: 'past', aspect: 'progressive' }))).toBe('valgė');
    expect(say(vp({ tense: 'future', aspect: 'progressive' }))).toBe('valgys');
    expect(say(vp({ aspect: 'prospective' }))).toBe('tuoj suvalgys');
    expect(say(vp({ tense: 'past', aspect: 'prospective' }))).toBe('ruošėsi suvalgyti');
    expect(say(vp({ mood: 'conditional' }))).toBe('suvalgytų');
  });

  test('the frequentative past with an adverb of habit', () => {
    expect(say(vp({ tense: 'past', modifier: cf('ALWAYS') }), SHE, { adverb: 'visada' })).toBe('visada valgydavo');
  });

  test('the resultative: būti + the agreeing active participle', () => {
    expect(say(vp({ aspect: 'resultative' }))).toBe('yra suvalgiusi');
    expect(say(vp({ aspect: 'resultative' }), HE)).toBe('yra suvalgęs');
    expect(say(vp({ aspect: 'resultative', tense: 'past' }), I)).toBe('buvau suvalgęs');
    expect(say(vp({ aspect: 'resultative' }), SHE, NEG)).toBe('nėra suvalgiusi');
    expect(say(vp({ aspect: 'resultative', mood: 'conditional' }))).toBe('būtų suvalgiusi');
  });

  test('ne- written onto the finite verb', () => {
    expect(say(vp({ tense: 'past', negative: true }), SHE, NEG)).toBe('nesuvalgė');
    expect(say(vp({ negative: true }), SHE, NEG)).toBe('nevalgo');
    expect(say(vp({ verb: cf('BE'), negative: true }), I, NEG)).toBe('nesu');
  });

  test('modals: the perfective infinitive, imperfective when negated; a governed ne-', () => {
    expect(say(vp({ modals: [{ verb: cf('MUST') }] }))).toBe('turi suvalgyti');
    expect(say(vp({ modals: [{ verb: cf('MUST') }], negative: true }), SHE, NEG)).toBe('neturi valgyti');
    expect(say(vp({ modals: [{ verb: cf('MUST') }], governedNegative: true }), SHE, { negation: { finite: false, inner: true } })).toBe('turi nevalgyti');
    expect(say(vp({ verb: cf('GO'), modals: [{ verb: cf('WILL') }, { verb: cf('CAN') }] }), I)).toBe('noriu galėti nueiti');
    expect(say(vp({ modals: [{ verb: cf('MUST') }], tense: 'past' }))).toBe('turėjo suvalgyti');
  });

  test('a suffix reflexive: -si after the form, after ne- when negated', () => {
    expect(say(vp({ verb: cf('LAUGH') }))).toBe('juokiasi');
    expect(say(vp({ verb: cf('LAUGH'), tense: 'past' }), I)).toBe('juokiausi');
    expect(say(vp({ verb: cf('LAUGH'), negative: true }), SHE, NEG)).toBe('nesijuokia');
    expect(say(vp({ verb: cf('LAUGH'), modals: [{ verb: cf('WILL') }] }))).toBe('nori juoktis');
  });

  test('the passive: būti + the agreeing passive participle', () => {
    expect(say(vp({ voice: 'passive', tense: 'past' }))).toBe('buvo suvalgyta');
    expect(say(vp({ voice: 'passive' }))).toBe('yra valgyta');
    expect(say(vp({ voice: 'passive', tense: 'future' }), HE)).toBe('bus suvalgytas');
  });
});

import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { adj, el, HAYASA, HIKARI, HOUHOU, JIKAN, np, TAKAI, YOI } from './ja.fixtures.js';
import { mannerGlossSegs } from './mannerGlossSegs.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

describe('mannerGlossSegs', () => {
  test('a measure or mode noun phrase closes with で', () => {
    expect(mannerGlossSegs(el(np(HAYASA, {}, { adjectives: [adj(TAKAI)], mannerGloss: true }))))
      .toEqual([{ t: '高い', r: 'たかい' }, { t: '速さ', r: 'はやさ' }, { t: 'で' }]);
    expect(text(mannerGlossSegs(el(np(HOUHOU, {}, { adjectives: [adj(YOI)], mannerGloss: true }))))).toBe('良い方法で');
  });

  test('a noun with no manner relation closes with のように', () => {
    expect(text(mannerGlossSegs(el(np(HIKARI, {}, { mannerGloss: true }))))).toBe('光のように');
  });

  test('keeps its determiner', () => {
    expect(text(mannerGlossSegs(el(np(HOUHOU, { definiteness: 'this' }, { mannerGloss: true }))))).toBe('この方法で');
  });

  // どの時間もでない is not Japanese: the circumfix's ない takes the particle's place.
  test('a no-determined gloss closes the circumfix with ない instead of the particle', () => {
    expect(mannerGlossSegs(el(np(JIKAN, { definiteness: 'no' }, { mannerGloss: true }))))
      .toEqual([{ t: 'どの' }, { t: '時間', r: 'じかん' }, { t: 'も' }, { t: 'ない' }]);
  });
});

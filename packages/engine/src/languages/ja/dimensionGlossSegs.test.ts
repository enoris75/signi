import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { dimensionGlossSegs } from './dimensionGlossSegs.js';
import { adj, type Forms, HAYASA, np, ONDO, OOKII, OOKISA, SHITSU, TAKAI, YOI } from './ja.fixtures.js';

/** A na-adjective ("reliable"), seeded with its attributive な. */
const TASHIKA: Forms = { role: 'adjective', base: '確かな', reading: 'たしかな' };

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

describe('dimensionGlossSegs', () => {
  test('marks the dimension noun with が before its plain i-adjective', () => {
    expect(dimensionGlossSegs(np(ONDO, {}, { adjectives: [adj(TAKAI)] })))
      .toEqual([{ t: '温度', r: 'おんど' }, { t: 'が' }, { t: '高い', r: 'たかい' }]);
  });

  test('a na-adjective drops its attributive な', () => {
    expect(dimensionGlossSegs(np(SHITSU, {}, { adjectives: [adj(TASHIKA)] })))
      .toEqual([{ t: '質', r: 'しつ' }, { t: 'が' }, { t: '確か', r: 'たしか' }]);
  });

  test('the dimension relation does not change the が-predicate', () => {
    expect(text(dimensionGlossSegs(np(OOKISA, {}, { adjectives: [adj(OOKII)] })))).toBe('大きさが大きい');
    expect(text(dimensionGlossSegs(np(SHITSU, {}, { adjectives: [adj(YOI)] })))).toBe('質が良い');
  });

  test('a degree adverb leads the adjective', () => {
    expect(dimensionGlossSegs(np(ONDO, {}, { adjectives: [adj(TAKAI, { degree: 'more' })] })))
      .toEqual([{ t: '温度', r: 'おんど' }, { t: 'が' }, { t: 'もっと' }, { t: '高い', r: 'たかい' }]);
    expect(text(dimensionGlossSegs(np(ONDO, {}, { adjectives: [adj(TAKAI, { degree: 'most' })] })))).toBe('温度が最も高い');
  });

  test('a lowered degree negates the adjective', () => {
    expect(dimensionGlossSegs(np(ONDO, {}, { adjectives: [adj(TAKAI, { degree: 'less' })] })))
      .toEqual([{ t: '温度', r: 'おんど' }, { t: 'が' }, { t: 'それほど' }, { t: '高くない', r: 'たかくない' }]);
    expect(text(dimensionGlossSegs(np(SHITSU, {}, { adjectives: [adj(TASHIKA, { degree: 'less' })] })))).toBe('質がそれほど確かではない');
  });

  test('without an adjective is the bare noun', () => {
    expect(dimensionGlossSegs(np(HAYASA))).toEqual([{ t: '速さ', r: 'はやさ' }]);
  });
});

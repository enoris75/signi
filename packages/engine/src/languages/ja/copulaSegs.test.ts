import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { adj, complement, DENSETSU, el, type Forms, INU, NEKO, np, OMOSHIROI, OOKII, SHIAWASE, SHINCHOU } from './ja.fixtures.js';
import { copulaSegs } from './copulaSegs.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');
const pred = (forms: Forms, extra: Forms = {}) => complement(np(forms, extra));

describe('copulaSegs', () => {
  describe('i-adjective', () => {
    test('inflects itself for tense and polarity', () => {
      expect(copulaSegs(pred(OOKII), 'present', false)).toEqual([{ t: '大き', r: 'おおき' }, { t: 'いです' }]);
      expect(text(copulaSegs(pred(OOKII), 'past', false))).toBe('大きかったです');
      expect(text(copulaSegs(pred(OOKII), 'present', true))).toBe('大きくないです');
      expect(text(copulaSegs(pred(OOKII), 'past', true))).toBe('大きくなかったです');
    });

    // Japanese has no future tense (C04).
    test('the future is the present', () => {
      expect(text(copulaSegs(pred(OOKII), 'future', false))).toBe('大きいです');
    });

    test('its degree adverb leads', () => {
      expect(copulaSegs(pred(OOKII, { degree: 'more' }), 'present', false)).toEqual([{ t: 'もっと' }, { t: '大き', r: 'おおき' }, { t: 'いです' }]);
      expect(text(copulaSegs(pred(OOKII, { degree: 'most' }), 'past', false))).toBe('最も大きかったです');
      expect(text(copulaSegs(pred(OOKII, { degree: 'equally' }), 'present', false))).toBe('同じくらい大きいです');
    });

    // A lowered degree is negative-polarity in Japanese: 大きい → 大きくない, itself an i-adjective.
    test('a lowered degree negates the adjective, which inflects as an i-adjective', () => {
      expect(copulaSegs(pred(OOKII, { degree: 'less' }), 'present', false))
        .toEqual([{ t: 'それほど' }, { t: '大きくな', r: 'おおきくな' }, { t: 'いです' }]);
      expect(text(copulaSegs(pred(OOKII, { degree: 'least' }), 'past', false))).toBe('最も大きくなかったです');
    });
  });

  describe('na-adjective', () => {
    test('drops its attributive な and takes the copula', () => {
      expect(copulaSegs(pred(SHINCHOU), 'present', false)).toEqual([{ t: '慎重', r: 'しんちょう' }, { t: 'です' }]);
      expect(text(copulaSegs(pred(SHINCHOU), 'past', false))).toBe('慎重でした');
      expect(text(copulaSegs(pred(SHINCHOU), 'present', true))).toBe('慎重ではありません');
      expect(text(copulaSegs(pred(SHINCHOU), 'past', true))).toBe('慎重ではありませんでした');
    });

    test('its degree adverb leads', () => {
      expect(text(copulaSegs(pred(SHIAWASE, { degree: 'more' }), 'present', false))).toBe('もっと幸せです');
    });

    test('a lowered degree becomes ～ではない and inflects as an i-adjective', () => {
      expect(copulaSegs(pred(SHIAWASE, { degree: 'less' }), 'present', false))
        .toEqual([{ t: 'それほど' }, { t: '幸せではな', r: 'しあわせではな' }, { t: 'いです' }]);
    });
  });

  describe('noun', () => {
    test('takes the copula for tense and polarity', () => {
      expect(copulaSegs(pred(DENSETSU), 'present', false)).toEqual([{ t: '伝説', r: 'でんせつ' }, { t: 'です' }]);
      expect(text(copulaSegs(pred(DENSETSU), 'past', false))).toBe('伝説でした');
      expect(text(copulaSegs(pred(DENSETSU), 'present', true))).toBe('伝説ではありません');
      expect(text(copulaSegs(pred(DENSETSU), 'past', true))).toBe('伝説ではありませんでした');
    });

    test('renders as a full noun phrase, every conjunct included', () => {
      expect(text(copulaSegs(complement(np(DENSETSU, {}, { adjectives: [adj(OMOSHIROI)] })), 'present', false))).toBe('面白い伝説です');
      expect(text(copulaSegs(complement(el(np(NEKO), np(INU))), 'present', false))).toBe('猫と犬です');
    });
  });
});

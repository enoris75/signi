import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { buildClauseSegments } from './buildClauseSegments.js';
import {
  adj, AGERU, ANATA, clause, complement, complements, el, HAYASA, HITO_GENERIC, HON, INU, NAKU, NEKO, NEZUMI, np, ONDO, OOKII, TABERU,
  TAKAI, vp, WATASHI,
} from './ja.fixtures.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');
const say = (...args: Parameters<typeof buildClauseSegments>): string => text(buildClauseSegments(...args));

describe('buildClauseSegments', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands alone, with no particle', () => {
      expect(buildClauseSegments(clause(np(NEKO, {}, { adjectives: [adj(OOKII)] })), 'は'))
        .toEqual([{ t: '大きい', r: 'おおきい' }, { t: '猫', r: 'ねこ' }]);
      expect(say(clause(np(NEKO)), 'が')).toBe('猫');
    });

    test('a dimension gloss is the が-predicate', () => {
      expect(say(clause(np(ONDO, {}, { adjectives: [adj(TAKAI)], dimensionGloss: true })), 'は')).toBe('温度が高い');
    });

    test('a manner gloss is the で-adverbial', () => {
      expect(say(clause(np(HAYASA, {}, { adjectives: [adj(TAKAI)], mannerGloss: true })), 'は')).toBe('高い速さで');
    });

    // With no predicate to supply it, a no-determined phrase closes its circumfix on ない itself.
    test('a no-determined noun phrase closes its どの … も on ない', () => {
      expect(say(clause(np(NEKO, { definiteness: 'no' })), 'は')).toBe('どの猫もない');
    });
  });

  describe('statements', () => {
    test('the subject takes the given particle ahead of the predicate', () => {
      expect(buildClauseSegments(clause(np(NEKO), vp(TABERU)), 'は')).toEqual([{ t: '猫', r: 'ねこ' }, { t: 'は' }, { t: '食べます', r: 'たべます' }]);
      expect(say(clause(np(NEKO), vp(TABERU)), 'が')).toBe('猫が食べます');
    });

    test('subject, complements, the を object, then the verb', () => {
      const phrase = clause(np(NEKO), vp(AGERU), { directObject: el(np(HON)), complements: complements({ terminus: complement(np(INU)) }) });
      expect(say(phrase, 'は')).toBe('猫は犬に本をあげます');
    });

    test('a coordinated subject takes one particle', () => {
      expect(say(clause(el(np(NEKO), np(INU)), vp(NAKU)), 'は')).toBe('猫と犬は泣きます');
    });

    // The relative clause is prenominal and plain-form.
    test('a subject with a relative clause', () => {
      const cat = np(NEKO, {}, { relative: { headRole: 'subject', verbPhrase: vp(TABERU), directObject: el(np(NEZUMI)) } });
      expect(say(clause(cat, vp(NAKU)), 'は')).toBe('ネズミを食べる猫は泣きます');
    });

    // どの猫も, never どの猫もは: the も replaces the topic particle, and the verb completes the circumfix.
    test('a no-determined subject ends in も and negates the verb', () => {
      expect(say(clause(np(NEKO, { definiteness: 'no' }), vp(TABERU)), 'は')).toBe('どの猫も食べません');
    });
  });

  describe('commands and citations', () => {
    test('a command drops its subject', () => {
      expect(say(clause(np(ANATA), vp(TABERU, { mood: 'imperative' }), { directObject: el(np(NEZUMI)) }), 'は')).toBe('ネズミを食べてください');
    });

    test('the dropped subject still picks the command form', () => {
      expect(say(clause(np(WATASHI, { number: 'plural' }), vp(TABERU, { mood: 'imperative' })), 'は')).toBe('食べましょう');
      expect(say(clause(np(ANATA, { number: 'plural' }), vp(TABERU, { mood: 'imperative' })), 'は')).toBe('食べてください');
    });

    test('an infinitive citation drops its subject', () => {
      expect(say(clause(np(HITO_GENERIC), vp(TABERU, { mood: 'infinitive' }), { directObject: el(np(NEZUMI)) }), 'は')).toBe('ネズミを食べる');
    });
  });
});

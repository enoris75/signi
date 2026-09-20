import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { buildClauseSegments } from './buildClauseSegments.js';
import {
  adj, AGERU, ANATA, clause, complement, complements, DESU, el, HAYASA, HIKIOKOSU, HITO, HITO_GENERIC, HON, IE, INU, KABE, MOTSU, NAKU,
  NEKO, NEZUMI, np, ONDO, OOKII, TABERU, TAKAI, vp, WATASHI,
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

    // A150: an inanimate owner keeps the topic は, and an "if" clause marks it with に in place of が.
    test('an inanimate owner\'s possession is the existential, the owner marked に in an if clause', () => {
      const houseHasWalls = clause(np(IE), vp(MOTSU), { directObject: el(np(KABE)) });
      expect(say(houseHasWalls, 'は')).toBe('家は壁があります');
      expect(say(clause(np(IE), vp(MOTSU, { mood: 'subjunctive' }), { directObject: el(np(KABE)) }), 'が')).toBe('家に壁があったら');
      expect(say(clause(np(NEKO), vp(MOTSU, { mood: 'subjunctive' }), { directObject: el(np(HON)) }), 'が')).toBe('猫が本を持っていたら');
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

  // An infinitive complement is a nominalized clause ahead of the predicate, closed by the tail the
  // governor's lexeme names (ことが / ことを / ように).
  describe('infinitive complement', () => {
    const KANOU = { role: 'adjective', base: '可能な', reading: 'かのうな', infinitive_link: 'ことが' };
    const NOZOMU = { base: '望む', reading: 'のぞむ', masu_present: '望みます', infinitive_link: 'ことを' };
    const eats = clause(np(NEKO), vp(TABERU, { mood: 'infinitive' }), { directObject: el(np(NEZUMI)) });

    test("an adjective's こと clause takes が, and the copula keeps the clause's register", () => {
      const able = complements({ predicative: complement(np(KANOU)) });
      expect(say(clause(np(NEKO), vp(DESU), { complements: able, infinitiveComplement: eats }), 'は')).toBe('猫はネズミを食べることが可能です');
      expect(say(clause(np(HITO_GENERIC), vp(DESU, { mood: 'infinitive' }), { complements: able, infinitiveComplement: eats }), 'は'))
        .toBe('ネズミを食べることが可能である');
    });

    test("a verb's takes the particle its lexeme names", () => {
      expect(say(clause(np(NEKO), vp(NOZOMU), { infinitiveComplement: eats }), 'は')).toBe('猫はネズミを食べることを望みます');
    });

    test('a governor with no link of its own falls back to ことを', () => {
      const nozomuBare = { base: '望む', reading: 'のぞむ', masu_present: '望みます' };
      expect(say(clause(np(NEKO), vp(nozomuBare), { infinitiveComplement: eats }), 'は')).toBe('猫はネズミを食べることを望みます');
    });
  });

  // The causative: the causee is the matrix object, but Japanese speaks it inside the clause with が
  // and closes the predicate on する — 人がネズミを食べるようにする.
  describe('causative (object control)', () => {
    const personEats = clause(np(HITO), vp(TABERU, { mood: 'infinitive' }), { directObject: el(np(NEZUMI)), control: 'object' });

    test('the causee leads the clause with が, and する closes it', () => {
      expect(say(clause(np(HITO_GENERIC), vp(HIKIOKOSU, { mood: 'infinitive' }),
        { directObject: el(np(HITO)), infinitiveComplement: personEats }), 'は')).toBe('人がネズミを食べるようにする');
    });

    test('a finite causative takes the polite する, and the causee never doubles as a を object', () => {
      expect(say(clause(np(NEKO), vp(HIKIOKOSU), { directObject: el(np(HITO)), infinitiveComplement: personEats }), 'は'))
        .toBe('猫は人がネズミを食べるようにします');
    });

    test('subject control leaves the object where it is', () => {
      const catEats = clause(np(NEKO), vp(TABERU, { mood: 'infinitive' }), { directObject: el(np(NEZUMI)) });
      expect(say(clause(np(NEKO), vp(HIKIOKOSU), { directObject: el(np(HON)), infinitiveComplement: catEats }), 'は'))
        .toBe('猫はネズミを食べるように本を引き起こします');
    });
  });
});

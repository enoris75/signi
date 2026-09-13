import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import {
  AGERU, complement, complements, concept, DESU, el, group, HAYAKU, HITSUYOU_GA_ARU, HON, HOZON_SURU, ICHIBA, IE, IKU, INU, ITSUMO,
  KESSHITE, KOTO_GA_DEKIRU, modal, NEZUMI, NOMU, np, SHINCHOU, SHIRU, TABERU, TAI, vp,
} from './ja.fixtures.js';
import { predicateSegs } from './predicateSegs.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');
const careful = complements({ predicative: complement(np(SHINCHOU)) });

describe('predicateSegs', () => {
  describe('tense and polarity', () => {
    test('the polite ます form carries tense and negation', () => {
      expect(predicateSegs(vp(TABERU), undefined, undefined)).toEqual([{ t: '食べます', r: 'たべます' }]);
      expect(predicateSegs(vp(TABERU, { tense: 'past' }), undefined, undefined)).toEqual([{ t: '食べました', r: 'たべました' }]);
      expect(text(predicateSegs(vp(TABERU, { negative: true }), undefined, undefined))).toBe('食べません');
      expect(text(predicateSegs(vp(TABERU, { negative: true, tense: 'past' }), undefined, undefined))).toBe('食べませんでした');
    });

    // Japanese has no future tense (C04).
    test('the future is the present', () => {
      expect(text(predicateSegs(vp(TABERU, { tense: 'future' }), undefined, undefined))).toBe('食べます');
    });

    test('a lexically stative polite form inflects from its own stem', () => {
      expect(predicateSegs(vp(SHIRU, { tense: 'past' }), undefined, undefined)).toEqual([{ t: '知っていました', r: 'しっていました' }]);
    });

    test('a kana verb takes no ruby', () => {
      expect(predicateSegs(vp(AGERU, { tense: 'past' }), undefined, undefined)).toEqual([{ t: 'あげました' }]);
    });
  });

  describe('word order', () => {
    test('complements, then the を object, then the adverb, then the verb', () => {
      expect(text(predicateSegs(vp(AGERU), el(np(HON)), complements({ terminus: complement(np(INU)) })))).toBe('犬に本をあげます');
      expect(predicateSegs(vp(TABERU, { modifier: concept(HAYAKU) }), el(np(NEZUMI)), complements({ locative: complement(np(IE)) })))
        .toEqual([{ t: '家', r: 'いえ' }, { t: 'で' }, { t: 'ネズミ' }, { t: 'を' }, { t: '速く', r: 'はやく' }, { t: '食べます', r: 'たべます' }]);
    });

    test('a coordinated object takes を once', () => {
      expect(text(predicateSegs(vp(TABERU), group('or', np(NEZUMI), np(HON)), undefined))).toBe('ネズミか本を食べます');
    });

    test('a modal’s adverb precedes the main verb’s', () => {
      const phrase = vp(TABERU, { modifier: concept(HAYAKU), modals: [modal(KOTO_GA_DEKIRU, ITSUMO)] });
      expect(text(predicateSegs(phrase, undefined, undefined))).toBe('いつも速く食べることができます');
    });
  });

  describe('negation', () => {
    test('a negative-polarity adverb forces the negative', () => {
      expect(text(predicateSegs(vp(TABERU, { modifier: concept(KESSHITE) }), undefined, undefined))).toBe('決して食べません');
      expect(text(predicateSegs(vp(TABERU, { tense: 'past', modals: [modal(KOTO_GA_DEKIRU, KESSHITE)] }), undefined, undefined)))
        .toBe('決して食べることができませんでした');
    });

    // どの…も needs the clause-final negative to complete the circumfix.
    test('a no-determined object ends in も instead of を and negates the verb', () => {
      expect(text(predicateSegs(vp(TABERU), el(np(NEZUMI, { definiteness: 'no' })), undefined))).toBe('どのネズミも食べません');
    });

    test('a no-determined route complement negates the verb', () => {
      expect(text(predicateSegs(vp(IKU), undefined, complements({ route: complement(np(ICHIBA, { definiteness: 'no' })) }))))
        .toBe('どの市場も行きません');
    });

    test('a no-determined subject negates the verb', () => {
      expect(text(predicateSegs(vp(TABERU), undefined, undefined, undefined, false, true))).toBe('食べません');
    });
  });

  describe('aspect', () => {
    test('the progressive is the te-form + います', () => {
      expect(predicateSegs(vp(TABERU, { aspect: 'progressive' }), undefined, undefined)).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'います' }]);
      expect(text(predicateSegs(vp(TABERU, { aspect: 'progressive', tense: 'past' }), undefined, undefined))).toBe('食べていました');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'progressive', negative: true }), undefined, undefined))).toBe('食べていません');
    });

    // The resultative is mapped onto the completive ～てしまう (B05).
    test('the resultative is the completive ～てしまいます', () => {
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative' }), undefined, undefined))).toBe('食べてしまいます');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), undefined, undefined))).toBe('食べてしまいました');
    });

    test('the prospective is the dictionary form + ところ + the copula', () => {
      expect(predicateSegs(vp(TABERU, { aspect: 'prospective' }), undefined, undefined))
        .toEqual([{ t: '食べる', r: 'たべる' }, { t: 'ところ' }, { t: 'です' }]);
      expect(text(predicateSegs(vp(TABERU, { aspect: 'prospective', tense: 'past' }), undefined, undefined))).toBe('食べるところでした');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'prospective', negative: true }), undefined, undefined))).toBe('食べるところではありません');
    });
  });

  describe('modals', () => {
    test('a verb-kind modal governs the dictionary form and carries tense and polarity', () => {
      expect(predicateSegs(vp(TABERU, { modals: [modal(HITSUYOU_GA_ARU)] }), undefined, undefined))
        .toEqual([{ t: '食べる', r: 'たべる' }, { t: '必要があり', r: 'ひつようがあり' }, { t: 'ます' }]);
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(HITSUYOU_GA_ARU)], tense: 'past' }), undefined, undefined))).toBe('食べる必要がありました');
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(HITSUYOU_GA_ARU)], negative: true }), undefined, undefined))).toBe('食べる必要がありません');
    });

    test('〜たい governs the polite stem and inflects as an i-adjective', () => {
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(TAI)] }), undefined, undefined))).toBe('食べたいです');
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(TAI)], negative: true, tense: 'past' }), undefined, undefined))).toBe('食べたくなかったです');
    });

    // Aspect has no periphrasis to compose with under a modal (B07).
    test('aspect is dropped under a modal', () => {
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(HITSUYOU_GA_ARU)], aspect: 'progressive' }), undefined, undefined)))
        .toBe('食べる必要があります');
    });
  });

  describe('conditional', () => {
    test('the subjunctive protasis takes the たら form', () => {
      expect(predicateSegs(vp(TABERU, { mood: 'subjunctive' }), el(np(NEZUMI)), undefined))
        .toEqual([{ t: 'ネズミ' }, { t: 'を' }, { t: '食べたら', r: 'たべたら' }]);
      expect(text(predicateSegs(vp(NOMU, { mood: 'subjunctive' }), undefined, undefined))).toBe('飲んだら');
    });

    test('the conditional apodosis keeps the polite path, tense and negation included', () => {
      expect(text(predicateSegs(vp(IKU, { mood: 'conditional' }), undefined, undefined))).toBe('行きます');
      expect(text(predicateSegs(vp(IKU, { mood: 'conditional', negative: true, tense: 'past' }), undefined, undefined))).toBe('行きませんでした');
    });
  });

  describe('relative plain form', () => {
    test('a relative predicate takes the plain dictionary or past form', () => {
      expect(predicateSegs(vp(TABERU), undefined, undefined, undefined, true)).toEqual([{ t: '食べる', r: 'たべる' }]);
      expect(predicateSegs(vp(TABERU, { tense: 'past' }), undefined, undefined, undefined, true)).toEqual([{ t: '食べた', r: 'たべた' }]);
      expect(text(predicateSegs(vp(NOMU, { tense: 'past' }), undefined, undefined, undefined, true))).toBe('飲んだ');
      expect(text(predicateSegs(vp(TABERU, { tense: 'future' }), el(np(NEZUMI)), undefined, undefined, true))).toBe('ネズミを食べる');
    });
  });

  describe('imperative', () => {
    test('a command is SOV, closing on the request form', () => {
      const phrase = vp(TABERU, { mood: 'imperative', modifier: concept(HAYAKU) });
      expect(text(predicateSegs(phrase, el(np(NEZUMI)), complements({ locative: complement(np(IE)) })))).toBe('家でネズミを速く食べてください');
    });

    test('the addressee picks the form, defaulting to the second person singular', () => {
      expect(text(predicateSegs(vp(TABERU, { mood: 'imperative' }), undefined, undefined, '1pl'))).toBe('食べましょう');
      expect(text(predicateSegs(vp(TABERU, { mood: 'imperative' }), undefined, undefined, '2pl'))).toBe('食べてください');
      expect(text(predicateSegs(vp(TABERU, { mood: 'imperative' }), undefined, undefined))).toBe('食べてください');
    });

    // The negative command is the plain prohibitive ～な, a deliberate register gap (see jaImperativeSegs).
    test('a negative-polarity adverb forces the prohibitive', () => {
      expect(text(predicateSegs(vp(TABERU, { mood: 'imperative', modifier: concept(KESSHITE) }), undefined, undefined))).toBe('決して食べるな');
    });

    // An instruction labels with the verbal noun (C03).
    test('an instruction labels with the verbal noun', () => {
      expect(text(predicateSegs(vp(HOZON_SURU, { mood: 'imperative', register: 'instruction' }), el(np(HON)), undefined))).toBe('本を保存');
    });

    // The する route is A110 ("make it X" for a noun or i-adjective); a na-adjective reads naturally.
    test('a copula command routes through する', () => {
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative' }), undefined, careful))).toBe('慎重にしてください');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative', negative: true }), undefined, careful))).toBe('慎重にしないでください');
    });
  });

  describe('infinitive', () => {
    test('a citation is the subjectless plain dictionary form, SOV', () => {
      expect(predicateSegs(vp(TABERU, { mood: 'infinitive' }), undefined, undefined)).toEqual([{ t: '食べる', r: 'たべる' }]);
      const phrase = vp(TABERU, { mood: 'infinitive', modifier: concept(HAYAKU) });
      expect(text(predicateSegs(phrase, el(np(NEZUMI)), complements({ locative: complement(np(IE)) })))).toBe('家でネズミを速く食べる');
    });
  });

  describe('copula', () => {
    test('the predicate carries the copula, after any adverb', () => {
      expect(predicateSegs(vp(DESU), undefined, careful)).toEqual([{ t: '慎重', r: 'しんちょう' }, { t: 'です' }]);
      expect(text(predicateSegs(vp(DESU, { modifier: concept(ITSUMO) }), undefined, careful))).toBe('いつも慎重です');
    });

    // A copula has no verb to carry aspect; the resultative is its past state.
    test('the past and the resultative both take the past copula', () => {
      expect(text(predicateSegs(vp(DESU, { tense: 'past' }), undefined, careful))).toBe('慎重でした');
      expect(text(predicateSegs(vp(DESU, { aspect: 'resultative' }), undefined, careful))).toBe('慎重でした');
    });

    // A42. The predicate closes on です, so the adjuncts are preposed rather than dropped.
    test('the locative and cause precede the adverb and the predicate', () => {
      const adjuncts = complements({ predicative: complement(np(SHINCHOU)), locative: complement(np(IE)), cause: complement(np(INU)) });
      expect(predicateSegs(vp(DESU), undefined, complements({ predicative: complement(np(SHINCHOU)), locative: complement(np(IE)) })))
        .toEqual([{ t: '家', r: 'いえ' }, { t: 'で' }, { t: '慎重', r: 'しんちょう' }, { t: 'です' }]);
      expect(text(predicateSegs(vp(DESU, { modifier: concept(ITSUMO) }), undefined, adjuncts))).toBe('家で犬のためにいつも慎重です');
    });

    test('negation, including a negative adverb’s, reaches the copula', () => {
      expect(text(predicateSegs(vp(DESU, { negative: true }), undefined, careful))).toBe('慎重ではありません');
      expect(text(predicateSegs(vp(DESU, { modifier: concept(KESSHITE) }), undefined, careful))).toBe('決して慎重ではありません');
    });
  });
});

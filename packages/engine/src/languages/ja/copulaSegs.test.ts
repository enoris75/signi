import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { adj, CHAIRO, complement, DENSETSU, el, type Forms, group, INU, NEKO, np, OMOSHIROI, OOKII, SHIAWASE, SHINCHOU, TSUKARETA } from './ja.fixtures.js';
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

    // A249: a negated lowered degree keeps its plain 大きくない and closes on わけ + the negated copula,
    // which carries the tense, rather than stacking 大きくなくないです.
    test('a negated lowered degree closes on わけではない in every form', () => {
      expect(copulaSegs(pred(OOKII, { degree: 'less' }), 'present', true))
        .toEqual([{ t: 'それほど' }, { t: '大きくな', r: 'おおきくな' }, { t: 'いわけではありません' }]);
      expect(text(copulaSegs(pred(OOKII, { degree: 'less' }), 'past', true))).toBe('それほど大きくないわけではありませんでした');
      expect(text(copulaSegs(pred(OOKII, { degree: 'less' }), 'present', true, 'prenominal'))).toBe('それほど大きくないわけではない');
      expect(text(copulaSegs(pred(OOKII, { degree: 'less' }), 'past', true, 'prenominal'))).toBe('それほど大きくないわけではなかった');
      expect(text(copulaSegs(pred(SHIAWASE, { degree: 'less' }), 'present', true))).toBe('それほど幸せではないわけではありません');
    });
  });

  // A115: the の- and た-adjectives lose their attributive ending in a predicate.
  describe('の- and た-adjectives', () => {

    test('a の-adjective drops its の and takes the copula, with its degree adverb', () => {
      expect(copulaSegs(pred(CHAIRO), 'present', false)).toEqual([{ t: '茶色', r: 'ちゃいろ' }, { t: 'です' }]);
      expect(text(copulaSegs(pred(CHAIRO), 'past', true))).toBe('茶色ではありませんでした');
      expect(text(copulaSegs(pred(CHAIRO, { degree: 'more' }), 'present', false))).toBe('もっと茶色です');
    });

    test('a た-adjective names the state 〜ている', () => {
      expect(copulaSegs(pred(TSUKARETA), 'present', false)).toEqual([{ t: '疲れて', r: 'つかれて' }, { t: 'います' }]);
      expect(text(copulaSegs(pred(TSUKARETA), 'present', true))).toBe('疲れていません');
      expect(text(copulaSegs(pred(TSUKARETA), 'past', false))).toBe('疲れていました');
    });
  });

  // A116 / A117: the prenominal form of a relative clause and the たら form of an "if" clause.
  describe('prenominal and たら forms', () => {
    test('a prenominal copula drops です: い / な / の stay attributive, a noun takes である', () => {
      expect(text(copulaSegs(pred(OOKII), 'past', false, 'prenominal'))).toBe('大きかった');
      expect(text(copulaSegs(pred(SHIAWASE), 'present', false, 'prenominal'))).toBe('幸せな');
      expect(text(copulaSegs(pred({ role: 'adjective', base: '茶色の', reading: 'ちゃいろの' }), 'present', false, 'prenominal'))).toBe('茶色の');
      expect(text(copulaSegs(pred(SHIAWASE), 'past', false, 'prenominal'))).toBe('幸せだった');
      expect(text(copulaSegs(pred(DENSETSU), 'present', false, 'prenominal'))).toBe('伝説である');
      expect(text(copulaSegs(pred(SHIAWASE), 'present', true, 'prenominal'))).toBe('幸せではない');
    });

    test('a たら copula carries no tense', () => {
      expect(text(copulaSegs(pred(OOKII), 'present', false, 'tara'))).toBe('大きかったら');
      expect(text(copulaSegs(pred(OOKII), 'present', true, 'tara'))).toBe('大きくなかったら');
      expect(text(copulaSegs(pred(SHIAWASE), 'past', false, 'tara'))).toBe('幸せだったら');
      expect(text(copulaSegs(pred(DENSETSU), 'present', true, 'tara'))).toBe('伝説ではなかったら');
      expect(text(copulaSegs(pred({ role: 'adjective', base: '疲れた', reading: 'つかれた' }), 'present', false, 'tara'))).toBe('疲れていたら');
    });

    // A278: before the indirect question's か a na- or の-adjective takes the terminal である, not its
    // attributive particle; every other cell is the prenominal form's.
    test('a closing copula is prenominal but for the na-adjective\'s である', () => {
      expect(copulaSegs(pred(SHIAWASE), 'present', false, 'closing')).toEqual([{ t: '幸せ', r: 'しあわせ' }, { t: 'である' }]);
      expect(text(copulaSegs(pred(CHAIRO), 'present', false, 'closing'))).toBe('茶色である');
      expect(text(copulaSegs(pred(SHIAWASE), 'past', false, 'closing'))).toBe('幸せだった');
      expect(text(copulaSegs(pred(SHIAWASE), 'present', true, 'closing'))).toBe('幸せではない');
      expect(text(copulaSegs(pred(OOKII), 'present', false, 'closing'))).toBe('大きい');
      expect(text(copulaSegs(pred(DENSETSU), 'present', false, 'closing'))).toBe('伝説である');
      expect(text(copulaSegs(pred(TSUKARETA), 'present', false, 'closing'))).toBe('疲れている');
    });

    // A323: before まで and 前に the affirmative is the change of state 〜になる.
    test('a reach copula is 〜になる in the affirmative, a state its verb, prenominal otherwise', () => {
      expect(copulaSegs(pred(SHIAWASE), 'present', false, 'reach')).toEqual([{ t: '幸せ', r: 'しあわせ' }, { t: 'になる' }]);
      expect(text(copulaSegs(pred(OOKII), 'present', false, 'reach'))).toBe('大きくなる');
      expect(text(copulaSegs(pred(DENSETSU), 'present', false, 'reach'))).toBe('伝説になる');
      expect(text(copulaSegs(pred(CHAIRO), 'present', false, 'reach'))).toBe('茶色になる');
      expect(text(copulaSegs(pred(SHIAWASE), 'past', false, 'reach'))).toBe('幸せになった');
      expect(text(copulaSegs(pred(SHIAWASE), 'present', true, 'reach'))).toBe('幸せではない');
      expect(copulaSegs(pred(TSUKARETA), 'present', false, 'reach')).toEqual([{ t: '疲れる', r: 'つかれる' }]);
      expect(text(copulaSegs(pred(TSUKARETA), 'past', false, 'reach'))).toBe('疲れた');
    });
  });

  // A128: under a modal the copula takes the form the modal governs, with no tense of its own. A03:
  // its polarity is its own again — the negation a modal puts on what it governs, not on itself.
  describe('governed forms', () => {
    test('the dictionary form: a na-adjective keeps である, an i-adjective and a state their own', () => {
      expect(copulaSegs(pred(SHIAWASE), 'present', false, 'dict')).toEqual([{ t: '幸せ', r: 'しあわせ' }, { t: 'である' }]);
      expect(text(copulaSegs(pred(OOKII), 'present', false, 'dict'))).toBe('大きい');
      expect(text(copulaSegs(pred(TSUKARETA), 'present', false, 'dict'))).toBe('疲れている');
      expect(text(copulaSegs(pred(CHAIRO), 'present', false, 'dict'))).toBe('茶色である');
      expect(text(copulaSegs(pred(DENSETSU), 'present', false, 'dict'))).toBe('伝説である');
    });

    test('the stem 〜たい attaches to', () => {
      expect(text(copulaSegs(pred(SHIAWASE), 'present', false, 'stem'))).toBe('幸せであり');
      expect(text(copulaSegs(pred(OOKII), 'present', false, 'stem'))).toBe('大きくあり');
      expect(text(copulaSegs(pred(TSUKARETA), 'present', false, 'stem'))).toBe('疲れてい');
      expect(text(copulaSegs(pred(DENSETSU), 'present', false, 'stem'))).toBe('伝説であり');
    });

    test('ignore tense, which the modal carries', () => {
      expect(text(copulaSegs(pred(DENSETSU), 'past', false, 'dict'))).toBe('伝説である');
      expect(text(copulaSegs(pred(OOKII), 'past', false, 'stem'))).toBe('大きくあり');
    });

    // A03: 幸せでない必要があります — the modal denies the predicate rather than itself.
    test('the negated dictionary form is the plain ない one', () => {
      expect(text(copulaSegs(pred(SHIAWASE), 'present', true, 'dict'))).toBe('幸せでない');
      expect(text(copulaSegs(pred(OOKII), 'past', true, 'dict'))).toBe('大きくない');
      expect(text(copulaSegs(pred(TSUKARETA), 'present', true, 'dict'))).toBe('疲れていない');
      expect(text(copulaSegs(pred(CHAIRO), 'present', true, 'dict'))).toBe('茶色でない');
      expect(text(copulaSegs(pred(DENSETSU), 'present', true, 'dict'))).toBe('伝説でない');
    });

    // 〜たい cannot sit on ない, so the negated stem goes through the same 〜ないでい bridge a verb
    // takes (幸せでないでいたいです; see naiSegs).
    test('the negated stem goes through 〜ないでい', () => {
      expect(text(copulaSegs(pred(SHIAWASE), 'present', true, 'stem'))).toBe('幸せでないでい');
      expect(text(copulaSegs(pred(OOKII), 'past', true, 'stem'))).toBe('大きくないでい');
      expect(text(copulaSegs(pred(TSUKARETA), 'present', true, 'stem'))).toBe('疲れていないでい');
      expect(text(copulaSegs(pred(DENSETSU), 'present', true, 'stem'))).toBe('伝説でないでい');
    });

    test('keep the degree adverb and a no predicate\'s でも', () => {
      expect(text(copulaSegs(pred(OOKII, { degree: 'more' }), 'present', false, 'dict'))).toBe('もっと大きい');
      expect(text(copulaSegs(complement(np(DENSETSU, { definiteness: 'no' })), 'present', false, 'dict'))).toBe('どの伝説でもある');
      // Denied, the same circumfix closes on the governed ない: どの伝説でもない必要があります.
      expect(text(copulaSegs(complement(np(DENSETSU, { definiteness: 'no' })), 'present', true, 'dict'))).toBe('どの伝説でもない');
    });
  });

  // A114: a no noun predicate closes its circumfix in the copula.
  test('a no noun predicate takes でも in the negative copula', () => {
    expect(text(copulaSegs(complement(np(DENSETSU, { definiteness: 'no' })), 'present', true))).toBe('どの伝説でもありません');
    expect(text(copulaSegs(complement(np(DENSETSU, { definiteness: 'no' })), 'past', true, 'prenominal'))).toBe('どの伝説でもなかった');
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
      // B12: predicates are chained with the copula's te-form で, not joined with と like things.
      expect(text(copulaSegs(complement(el(np(NEKO), np(INU))), 'present', false))).toBe('猫で犬です');
    });
  });

  // B12: every conjunct of a coordinated predicate is kept, each in its connective form, and the copula
  // inflects on the last.
  describe('a coordinated predicate', () => {
    test('"and" chains the te-form of each class: くて, で, ていて', () => {
      expect(copulaSegs(complement(el(np(OOKII), np(SHIAWASE))), 'present', false))
        .toEqual([{ t: '大き', r: 'おおき' }, { t: 'くて' }, { t: '幸せ', r: 'しあわせ' }, { t: 'です' }]);
      expect(text(copulaSegs(complement(el(np(SHIAWASE), np(OOKII))), 'past', false))).toBe('幸せで大きかったです');
      expect(text(copulaSegs(complement(el(np(TSUKARETA), np(CHAIRO), np(DENSETSU))), 'present', false))).toBe('疲れていて茶色で伝説です');
      expect(text(copulaSegs(complement(el(np(OOKII, { degree: 'more' }), np(SHIAWASE))), 'present', false))).toBe('もっと大きくて幸せです');
    });

    test('"or" joins whole predicates with か, each in the clause\'s tense', () => {
      expect(text(copulaSegs(complement(group('or', np(OOKII), np(SHIAWASE))), 'present', false))).toBe('大きいか幸せです');
      expect(text(copulaSegs(complement(group('or', np(OOKII), np(SHIAWASE))), 'past', false))).toBe('大きかったか幸せでした');
      expect(text(copulaSegs(complement(group('or', np(DENSETSU), np(TSUKARETA))), 'past', false))).toBe('伝説だったか疲れていました');
      expect(text(copulaSegs(complement(group('or', np(TSUKARETA), np(DENSETSU))), 'present', false))).toBe('疲れているか伝説です');
    });

    test('a negation reads "neither … nor": も on every conjunct, the negative after the last', () => {
      expect(text(copulaSegs(complement(el(np(OOKII), np(SHIAWASE))), 'present', true))).toBe('大きくも幸せでもありません');
      expect(text(copulaSegs(complement(group('or', np(OOKII), np(DENSETSU))), 'past', true))).toBe('大きくも伝説でもありませんでした');
      expect(text(copulaSegs(complement(el(np(OOKII), np(TSUKARETA))), 'present', true))).toBe('大きくも疲れてもいません');
    });

    test('each form closes on the last conjunct', () => {
      const bigHappy = complement(el(np(OOKII), np(SHIAWASE)));
      expect(text(copulaSegs(bigHappy, 'present', false, 'prenominal'))).toBe('大きくて幸せな');
      expect(text(copulaSegs(bigHappy, 'past', true, 'prenominal'))).toBe('大きくも幸せでもなかった');
      expect(text(copulaSegs(bigHappy, 'present', false, 'tara'))).toBe('大きくて幸せだったら');
      expect(text(copulaSegs(bigHappy, 'present', true, 'tara'))).toBe('大きくも幸せでもなかったら');
      expect(text(copulaSegs(bigHappy, 'present', false, 'citation'))).toBe('大きくて幸せである');
      expect(text(copulaSegs(bigHappy, 'present', false, 'dict'))).toBe('大きくて幸せである');
      expect(text(copulaSegs(bigHappy, 'present', false, 'stem'))).toBe('大きくて幸せであり');
      // A03: denied by the modal that governs it, a governed pair closes on the same "neither … nor".
      expect(text(copulaSegs(bigHappy, 'present', true, 'dict'))).toBe('大きくも幸せでもない');
      expect(text(copulaSegs(bigHappy, 'present', true, 'stem'))).toBe('大きくも幸せでもないでい');
      expect(text(copulaSegs(complement(group('or', np(OOKII), np(SHIAWASE))), 'past', false, 'tara'))).toBe('大きいか幸せだったら');
    });
  });

  // An infinitive citation closes in the plain written style, as a verb's closes on its dictionary form.
  describe('citation', () => {
    test('closes each class plainly, and negates', () => {
      expect(text(copulaSegs(pred(SHINCHOU), 'present', false, 'citation'))).toBe('慎重である');
      expect(text(copulaSegs(pred(OOKII), 'present', false, 'citation'))).toBe('大きい');
      expect(text(copulaSegs(pred(TSUKARETA), 'present', false, 'citation'))).toBe('疲れている');
      expect(text(copulaSegs(pred(DENSETSU), 'present', false, 'citation'))).toBe('伝説である');
      expect(text(copulaSegs(pred(SHINCHOU), 'present', true, 'citation'))).toBe('慎重ではない');
      expect(text(copulaSegs(pred(OOKII), 'present', true, 'citation'))).toBe('大きくない');
    });
  });
});

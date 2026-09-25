import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import {
  AGERU, complement, complements, concept, DESU, el, group, HAYAKU, HITSUYOU_GA_ARU, HON, HOZON_SURU, ICHIBA, IE, IKU, INU, ITSUMO,
  KABE, KESSHITE, KOTO_GA_DEKIRU, modal, MOTSU, NEZUMI, NOMU, np, OMOERU, SHINCHOU, SHIRU, TABERU, TAI, vp,
} from './ja.fixtures.js';
import { predicateSegs } from './predicateSegs.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');
const careful = complements({ predicative: complement(np(SHINCHOU)) });

describe('predicateSegs', () => {
  // A109: BE with a locative and no predicative is the existential いる / ある, the place taking に.
  describe('existential BE', () => {
    const inHouse = complements({ locative: complement(np(IE)) });

    test('an animate subject takes いる, an inanimate one ある', () => {
      expect(text(predicateSegs(vp(DESU), undefined, inHouse, undefined, false, false, true))).toBe('家にいます');
      expect(text(predicateSegs(vp(DESU), undefined, inHouse))).toBe('家にあります');
      expect(text(predicateSegs(vp(DESU, { negative: true, tense: 'past' }), undefined, inHouse, undefined, false, false, true))).toBe('家にいませんでした');
    });

    test('the plain, modal, command, たら and aspect paths compose on the existential verb', () => {
      expect(text(predicateSegs(vp(DESU), undefined, inHouse, undefined, true, false, true))).toBe('家にいる');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(HITSUYOU_GA_ARU)] }), undefined, inHouse, undefined, false, false, true))).toBe('家にいる必要があります');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative' }), undefined, inHouse, '2sg', false, false, true))).toBe('家にいてください');
      expect(text(predicateSegs(vp(DESU, { mood: 'subjunctive' }), undefined, inHouse, undefined, false, false, true))).toBe('家にいたら');
      expect(text(predicateSegs(vp(DESU, { aspect: 'progressive' }), undefined, inHouse, undefined, false, false, true))).toBe('家にいます');
      expect(text(predicateSegs(vp(DESU, { aspect: 'resultative' }), undefined, inHouse, undefined, false, false, true))).toBe('家にいました');
    });

    // A120: BE with no complement at all states that the subject exists, with the same verb.
    test('with no complement at all, BE is the existential, in every form', () => {
      expect(text(predicateSegs(vp(DESU), undefined, undefined, undefined, false, false, true))).toBe('います');
      expect(text(predicateSegs(vp(DESU, { negative: true, tense: 'past' }), undefined, undefined))).toBe('ありませんでした');
      expect(text(predicateSegs(vp(DESU), undefined, undefined, undefined, true, false, true))).toBe('いる');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(KOTO_GA_DEKIRU)] }), undefined, undefined, undefined, false, false, true))).toBe('いることができます');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative' }), undefined, undefined, '2sg', false, false, true))).toBe('いてください');
      expect(text(predicateSegs(vp(DESU, { mood: 'subjunctive', negative: true }), undefined, undefined, undefined, false, false, true))).toBe('いなかったら');
    });

    // A121: an elided place has no pro-form; the clause is the existential.
    test('an elided locative leaves the existential', () => {
      const elided = { type: 'locative' as const, complement: complement(np(IE)) };
      expect(text(predicateSegs(vp(DESU, { negative: true, elided }), undefined, undefined, undefined, false, false, true))).toBe('いません');
    });

    // Localization B67: an adverb of place is where the subject is, so it takes the existential's に
    // too; any other verb keeps the adverb's own で.
    test('an adverb of place takes its に form', () => {
      const here = concept({ base: 'ここで', subtype: 'place', locative_ni: 'ここに' });
      expect(text(predicateSegs(vp(DESU, { modifier: here }), undefined, undefined, undefined, false, false, true))).toBe('ここにいます');
      expect(text(predicateSegs(vp(DESU, { modifier: here }), undefined, undefined))).toBe('ここにあります');
      expect(text(predicateSegs(vp(DESU, { modifier: here }), undefined, undefined, undefined, true, false, true))).toBe('ここにいる');
      expect(text(predicateSegs(vp(TABERU, { modifier: here }), undefined, undefined))).toBe('ここで食べます');
      expect(text(predicateSegs(vp(DESU, { modifier: here }), undefined, careful))).toBe('ここで慎重です');
    });
  });

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

    // FOLLOW's 続く takes its object with に, as its lexeme's `object_particle` says (localization C24).
    test('a verb that names its object particle takes it in place of を', () => {
      const TSUZUKU = { base: '続く', reading: 'つづく', masu_present: '続きます', masu_present_reading: 'つづきます', object_particle: 'に' };
      expect(text(predicateSegs(vp(TSUZUKU), el(np(INU)), undefined))).toBe('犬に続きます');
    });

    // A373: a verb whose opponent takes the particle its object already takes falls back to を相手に
    // beside that object; alone, the opponent keeps the verb's own particle.
    test('an opponent sharing the object’s particle takes を相手に beside the object', () => {
      const KATSU = { base: '勝つ', reading: 'かつ', masu_present: '勝ちます', masu_present_reading: 'かちます', object_particle: 'に', opponent_prep: 'に' };
      const vsDog = complements({ opponent: { ...complement(np(INU)), link: 'に' } });
      expect(text(predicateSegs(vp(KATSU), el(np(HON)), vsDog))).toBe('犬を相手に本に勝ちます');
      expect(text(predicateSegs(vp(KATSU), undefined, vsDog))).toBe('犬に勝ちます');
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

    // A216: a `no` possessor closes the circumfix around its whole phrase, which negates the verb.
    test('a no-determined possessor in the object or a complement negates the verb', () => {
      const noDogs = (forms: typeof IE) => np(forms, {}, { possessor: np(INU, { definiteness: 'no' }) });
      expect(text(predicateSegs(vp(TABERU), el(noDogs(HON)), undefined))).toBe('どの犬の本も食べません');
      expect(text(predicateSegs(vp(TABERU), undefined, complements({ locative: complement(noDogs(IE)) })))).toBe('どの犬の家でも食べません');
      // A comparison counts here too, as a `no` head's does (A181).
      expect(text(predicateSegs(vp(TABERU), undefined, complements({ manner: complement(noDogs(IE)) })))).toBe('どの犬の家のようにも食べません');
    });
  });

  // A150: HAVE with an inanimate owner is the existential ある, its object marked が, not 持つ + を.
  describe('possession by an inanimate owner', () => {
    const walls = el(np(KABE));

    test('takes ある and が, in every tense and polarity', () => {
      expect(predicateSegs(vp(MOTSU), walls, undefined)).toEqual([{ t: '壁', r: 'かべ' }, { t: 'が' }, { t: 'あります' }]);
      expect(text(predicateSegs(vp(MOTSU, { tense: 'past' }), walls, undefined))).toBe('壁がありました');
      expect(text(predicateSegs(vp(MOTSU, { negative: true, tense: 'past' }), walls, undefined))).toBe('壁がありませんでした');
    });

    test('ある is a state verb: no 〜ている, and the resultative reads as the past', () => {
      expect(text(predicateSegs(vp(MOTSU, { aspect: 'progressive' }), walls, undefined))).toBe('壁があります');
      expect(text(predicateSegs(vp(MOTSU, { aspect: 'resultative' }), walls, undefined))).toBe('壁がありました');
    });

    test('the plain, modal and たら paths compose on it', () => {
      expect(text(predicateSegs(vp(MOTSU), walls, undefined, undefined, true))).toBe('壁がある');
      expect(text(predicateSegs(vp(MOTSU, { modals: [modal(HITSUYOU_GA_ARU)] }), walls, undefined))).toBe('壁がある必要があります');
      expect(text(predicateSegs(vp(MOTSU, { mood: 'subjunctive' }), walls, undefined))).toBe('壁があったら');
    });

    test('a no-determined object keeps its も in place of が', () => {
      expect(text(predicateSegs(vp(MOTSU), el(np(KABE, { definiteness: 'no' })), undefined))).toBe('どの壁もありません');
    });

    test('regression: an animate owner keeps 持つ and を', () => {
      expect(text(predicateSegs(vp(MOTSU), walls, undefined, undefined, false, false, true))).toBe('壁を持っています');
    });

    // A217: the existential verb follows what exists, which under HAVE is the thing possessed.
    test('an animate thing possessed takes いる', () => {
      expect(text(predicateSegs(vp(MOTSU), el(np(NEZUMI)), undefined))).toBe('ネズミがいます');
      expect(text(predicateSegs(vp(MOTSU, { negative: true, tense: 'past' }), el(np(NEZUMI)), undefined))).toBe('ネズミがいませんでした');
      expect(text(predicateSegs(vp(MOTSU, { mood: 'subjunctive' }), el(np(NEZUMI)), undefined))).toBe('ネズミがいたら');
    });

    // A relative clause on the thing possessed has no object left: the head fills it, and says which.
    test('animateObject names the thing possessed when the object slot is the gap', () => {
      expect(text(predicateSegs(vp(MOTSU), undefined, undefined, undefined, true, false, false, true))).toBe('いる');
      expect(text(predicateSegs(vp(MOTSU), undefined, undefined, undefined, true, false, false, false))).toBe('ある');
      expect(text(predicateSegs(vp(MOTSU), undefined, undefined, undefined, true))).toBe('ある');
      // BE reads its subject, whatever it is told about an object.
      const inHouse = complements({ locative: complement(np(IE)) });
      expect(text(predicateSegs(vp(DESU), undefined, inHouse, undefined, false, false, false, true))).toBe('家にあります');
    });
  });

  // A132: a state verb says the state holds with 〜ている; its plain 〜ます names the change of state.
  describe('a state verb', () => {
    test('takes 〜ている in every tense and polarity', () => {
      expect(predicateSegs(vp(MOTSU), el(np(HON)), undefined, undefined, false, false, true)).toEqual([{ t: '本', r: 'ほん' }, { t: 'を' }, { t: '持って', r: 'もって' }, { t: 'います' }]);
      expect(text(predicateSegs(vp(MOTSU, { tense: 'past' }), undefined, undefined, undefined, false, false, true))).toBe('持っていました');
      expect(text(predicateSegs(vp(MOTSU, { negative: true, tense: 'past' }), undefined, undefined, undefined, false, false, true))).toBe('持っていませんでした');
      expect(text(predicateSegs(vp(SHIRU, { tense: 'past' }), undefined, undefined))).toBe('知っていました');
      expect(text(predicateSegs(vp(MOTSU, { mood: 'conditional' }), undefined, undefined, undefined, false, false, true))).toBe('持っています');
    });

    test('builds the たら protasis on 〜ている', () => {
      expect(text(predicateSegs(vp(MOTSU, { mood: 'subjunctive' }), undefined, undefined, undefined, false, false, true))).toBe('持っていたら');
      expect(text(predicateSegs(vp(MOTSU, { mood: 'subjunctive', negative: true }), undefined, undefined, undefined, false, false, true))).toBe('持っていなかったら');
    });

    // A279: a content clause reports the state in the plain 〜ている; a relative clause (`true`) does not.
    test('a content clause takes the plain 〜ている, a relative clause the dictionary form', () => {
      expect(text(predicateSegs(vp(MOTSU), undefined, undefined, undefined, 'quote', false, true))).toBe('持っている');
      expect(text(predicateSegs(vp(MOTSU, { tense: 'past' }), undefined, undefined, undefined, 'question', false, true))).toBe('持っていた');
      expect(text(predicateSegs(vp(MOTSU, { negative: true }), undefined, undefined, undefined, 'content', false, true))).toBe('持っていない');
      expect(text(predicateSegs(vp(SHIRU, { negative: true }), undefined, undefined, undefined, 'quote', false, true))).toBe('知らない');
      expect(text(predicateSegs(vp(MOTSU), undefined, undefined, undefined, true, false, true))).toBe('持つ');
    });

    test('a state whose negative is the event\'s takes the plain negative', () => {
      expect(text(predicateSegs(vp(SHIRU, { negative: true }), undefined, undefined))).toBe('知りません');
      expect(text(predicateSegs(vp(SHIRU, { negative: true, tense: 'past' }), undefined, undefined))).toBe('知りませんでした');
      expect(text(predicateSegs(vp(SHIRU, { mood: 'subjunctive', negative: true }), undefined, undefined))).toBe('知らなかったら');
      expect(text(predicateSegs(vp(SHIRU, { mood: 'subjunctive' }), undefined, undefined))).toBe('知っていたら');
    });

    test('a Japanese state verb keeps 〜ます', () => {
      expect(text(predicateSegs(vp(OMOERU), undefined, undefined))).toBe('思えます');
      expect(text(predicateSegs(vp(OMOERU, { tense: 'past', negative: true }), undefined, undefined))).toBe('思えませんでした');
    });

    test('regression: a relative clause, a modal, a command and the other aspects keep their own form', () => {
      expect(text(predicateSegs(vp(MOTSU), el(np(HON)), undefined, undefined, true, false, true))).toBe('本を持つ');
      expect(text(predicateSegs(vp(MOTSU, { tense: 'past' }), undefined, undefined, undefined, true, false, true))).toBe('持った');
      expect(text(predicateSegs(vp(MOTSU, { modals: [modal(HITSUYOU_GA_ARU)] }), undefined, undefined, undefined, false, false, true))).toBe('持つ必要があります');
      expect(text(predicateSegs(vp(MOTSU, { mood: 'imperative' }), undefined, undefined, '2sg', false, false, true))).toBe('持ってください');
      // The perfect of a state is its state's past, "has had" (B05).
      expect(text(predicateSegs(vp(MOTSU, { aspect: 'resultative' }), undefined, undefined, undefined, false, false, true))).toBe('持っていました');
    });
  });

  describe('aspect', () => {
    test('the progressive is the te-form + います', () => {
      expect(predicateSegs(vp(TABERU, { aspect: 'progressive' }), undefined, undefined)).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'います' }]);
      expect(text(predicateSegs(vp(TABERU, { aspect: 'progressive', tense: 'past' }), undefined, undefined))).toBe('食べていました');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'progressive', negative: true }), undefined, undefined))).toBe('食べていません');
    });

    // B05: the resultative is a perfect — the past "has eaten", else the resultant state 〜ている.
    test('the resultative is a perfect', () => {
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative' }), undefined, undefined))).toBe('食べました');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), undefined, undefined))).toBe('食べていました');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative', negative: true }), undefined, undefined))).toBe('食べていません');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative' }), undefined, undefined, undefined, true))).toBe('食べた');
      expect(text(predicateSegs(vp(TABERU, { aspect: 'resultative', mood: 'subjunctive' }), undefined, undefined))).toBe('食べていたら');
    });

    // A counterfactual main clause's "would have run" is the past resultant state, whatever its tense.
    test('the resultative of a conditional main clause is the past 〜ていました', () => {
      expect(text(predicateSegs(vp(IKU, { aspect: 'resultative', mood: 'conditional' }), undefined, undefined))).toBe('行っていました');
      expect(text(predicateSegs(vp(IKU, { aspect: 'resultative', mood: 'conditional', negative: true, tense: 'future' }), undefined, undefined)))
        .toBe('行っていませんでした');
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

    // A128: the copula has no verb for the modal to suffix, so the modal governs its predicate instead.
    test('a modal on the copula governs the predicate in its dictionary form or stem', () => {
      expect(text(predicateSegs(vp(DESU, { modals: [modal(HITSUYOU_GA_ARU)] }), undefined, careful))).toBe('慎重である必要があります');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(HITSUYOU_GA_ARU)], negative: true, tense: 'past' }), undefined, careful)))
        .toBe('慎重である必要がありませんでした');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(KOTO_GA_DEKIRU)] }), undefined, careful))).toBe('慎重であることができます');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(TAI)] }), undefined, careful))).toBe('慎重でありたいです');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(TAI), modal(KOTO_GA_DEKIRU)] }), undefined, careful)))
        .toBe('慎重であることができるようになりたいです');
    });

    test('a modal on the copula takes the plain and たら endings, and keeps the adverbs ahead of the predicate', () => {
      expect(text(predicateSegs(vp(DESU, { modals: [modal(HITSUYOU_GA_ARU)] }), undefined, careful, undefined, true))).toBe('慎重である必要がある');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(KOTO_GA_DEKIRU)], mood: 'subjunctive' }), undefined, careful)))
        .toBe('慎重であることができたら');
      expect(text(predicateSegs(vp(DESU, { modals: [modal(HITSUYOU_GA_ARU, ITSUMO)], modifier: concept(HAYAKU) }), undefined, careful)))
        .toBe('いつも速く慎重である必要があります');
    });

    // B07: an aspect stands under a modal in the form the modal governs (it used to be dropped).
    test('an aspect composes under a modal', () => {
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(HITSUYOU_GA_ARU)], aspect: 'progressive' }), undefined, undefined)))
        .toBe('食べている必要があります');
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(TAI)], aspect: 'resultative', negative: true }), undefined, undefined)))
        .toBe('食べていたくないです');
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(KOTO_GA_DEKIRU)], aspect: 'progressive', mood: 'subjunctive' }), undefined, undefined)))
        .toBe('食べていることができたら');
      expect(text(predicateSegs(vp(TABERU, { modals: [modal(HITSUYOU_GA_ARU)], aspect: 'progressive', tense: 'past' }), undefined, undefined, undefined, true)))
        .toBe('食べている必要があった');
    });
  });

  // ── A03: each word of the verb group takes its own negation ───────────────
  // `negative` is still the finite element's — with a modal, the outermost one's. `governedNegative`
  // denies the group the innermost modal governs, and Japanese spells it as that group's ない form.
  describe('modal polarity', () => {
    const TABENAI = { ...TABERU, nai: '食べない', nai_reading: 'たべない' };
    const govNeg = (extra: Parameters<typeof vp>[1] = {}) => vp(TABENAI, { governedNegative: true, ...extra });

    test('a dict governor takes the ない form, a stem governor the 〜ないでい bridge', () => {
      expect(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)] }), undefined, undefined))
        .toEqual([{ t: '食べない', r: 'たべない' }, { t: '必要があり', r: 'ひつようがあり' }, { t: 'ます' }]);
      expect(text(predicateSegs(govNeg({ modals: [modal(KOTO_GA_DEKIRU)] }), undefined, undefined))).toBe('食べないことができます');
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI)] }), undefined, undefined))).toBe('食べないでいたいです');
    });

    test('the finite negation and the governed one are independent', () => {
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI)], negative: true }), undefined, undefined))).toBe('食べないでいたくないです');
      expect(text(predicateSegs(vp(TABENAI, { modals: [modal(TAI)], negative: true }), undefined, undefined))).toBe('食べたくないです');
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)], negative: true }), undefined, undefined))).toBe('食べない必要がありません');
    });

    test('an inner modal denies its own suffix', () => {
      expect(text(predicateSegs(vp(TABENAI, { modals: [modal(HITSUYOU_GA_ARU), { ...modal(KOTO_GA_DEKIRU), negative: true }] }), undefined, undefined)))
        .toBe('食べることができない必要があります');
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU), modal(KOTO_GA_DEKIRU)] }), undefined, undefined)))
        .toBe('食べないことができる必要があります');
    });

    test('the plain (relative) and たら endings carry the governed ない', () => {
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)] }), undefined, undefined, undefined, true))).toBe('食べない必要がある');
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI)] }), undefined, undefined, undefined, true))).toBe('食べないでいたい');
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)], mood: 'subjunctive' }), undefined, undefined))).toBe('食べない必要があったら');
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI)], mood: 'subjunctive' }), undefined, undefined))).toBe('食べないでいたかったら');
    });

    // The citation a modal-headed definition folds into (A222) closes the same way, plainly.
    test('the infinitive citation carries the governed ない', () => {
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)], mood: 'infinitive' }), undefined, undefined))).toBe('食べない必要がある');
    });

    // A128 + A03: the copula's predicate is what the modal governs, so the ない goes on the predicate.
    test('the copula under a modal is denied on its predicate', () => {
      expect(text(predicateSegs(vp(DESU, { governedNegative: true, modals: [modal(HITSUYOU_GA_ARU)] }), undefined, careful)))
        .toBe('慎重でない必要があります');
      expect(text(predicateSegs(vp(DESU, { governedNegative: true, modals: [modal(TAI)] }), undefined, careful)))
        .toBe('慎重でないでいたいです');
      expect(text(predicateSegs(vp(DESU, { governedNegative: true, modals: [modal(HITSUYOU_GA_ARU)] }), undefined, careful, undefined, true)))
        .toBe('慎重でない必要がある');
    });

    test('an aspect under a modal is denied on its auxiliary', () => {
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)], aspect: 'progressive' }), undefined, undefined)))
        .toBe('食べていない必要があります');
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI)], aspect: 'resultative' }), undefined, undefined)))
        .toBe('食べていないでいたいです');
    });

    // The どの…も circumfix closes on the ない that is actually there: the governed one, leaving the
    // modal positive. Denying the modal as well would say something else ("does not want to").
    test('a no argument concords with the governed ない, not with the finite modal', () => {
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI)] }), el(np(NEZUMI, { definiteness: 'no' })), undefined)))
        .toBe('どのネズミも食べないでいたいです');
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)] }), undefined, undefined, undefined, false, true)))
        .toBe('食べない必要があります');
      expect(text(predicateSegs(govNeg({ modals: [modal(HITSUYOU_GA_ARU)] }), undefined, complements({ route: complement(np(ICHIBA, { definiteness: 'no' })) }))))
        .toBe('どの市場も食べない必要があります');
      // An inner modal's own ない closes the circumfix just as well.
      expect(text(predicateSegs(vp(TABENAI, { modals: [modal(HITSUYOU_GA_ARU), { ...modal(KOTO_GA_DEKIRU), negative: true }] }), el(np(NEZUMI, { definiteness: 'no' })), undefined)))
        .toBe('どのネズミも食べることができない必要があります');
      // With no negation inside the chain the concord still falls on the finite modal, as it always has.
      expect(text(predicateSegs(vp(TABENAI, { modals: [modal(TAI)] }), el(np(NEZUMI, { definiteness: 'no' })), undefined)))
        .toBe('どのネズミも食べたくないです');
    });

    // The adverb keeps going to the finite element by design (see groupHasNegativeAdverb).
    test('a negative-polarity adverb still negates the finite modal', () => {
      expect(text(predicateSegs(govNeg({ modals: [modal(TAI, KESSHITE)] }), undefined, undefined)))
        .toBe('決して食べないでいたくないです');
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

    // B13: the negative is the plain nai-form too, whatever negates the clause.
    test('a negated relative predicate takes the plain negative', () => {
      const tabenai = { ...TABERU, nai: '食べない', nai_reading: 'たべない' };
      expect(predicateSegs(vp(tabenai, { negative: true }), undefined, undefined, undefined, true)).toEqual([{ t: '食べない', r: 'たべない' }]);
      expect(text(predicateSegs(vp(tabenai, { negative: true, tense: 'past' }), undefined, undefined, undefined, true))).toBe('食べなかった');
      expect(text(predicateSegs(vp(tabenai, { modifier: concept(KESSHITE) }), undefined, undefined, undefined, true))).toBe('決して食べない');
      expect(text(predicateSegs(vp(tabenai), undefined, undefined, undefined, true, true))).toBe('食べない');
      expect(text(predicateSegs(vp(MOTSU, { negative: true }), el(np(HON)), undefined, undefined, true, false, true))).toBe('本を持たない');
      // An inanimate owner's existential ある has the suppletive negative ない.
      expect(text(predicateSegs(vp(MOTSU, { negative: true }), el(np(HON)), undefined, undefined, true))).toBe('本がない');
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

    // A110: a copula command is built on なる, following the addressee; する would be causative.
    test('a copula command is built on なる', () => {
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative' }), undefined, careful))).toBe('慎重になってください');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative', negative: true }), undefined, careful))).toBe('慎重にならないでください');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative' }), undefined, careful, '1pl'))).toBe('慎重になりましょう');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative', negative: true }), undefined, careful, '1pl'))).toBe('慎重になるのはやめましょう');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative' }), undefined, careful, '2pl'))).toBe('慎重になってください');
    });
  });

  describe('infinitive', () => {
    test('a citation is the subjectless plain dictionary form, SOV', () => {
      expect(predicateSegs(vp(TABERU, { mood: 'infinitive' }), undefined, undefined)).toEqual([{ t: '食べる', r: 'たべる' }]);
      const phrase = vp(TABERU, { mood: 'infinitive', modifier: concept(HAYAKU) });
      expect(text(predicateSegs(phrase, el(np(NEZUMI)), complements({ locative: complement(np(IE)) })))).toBe('家でネズミを速く食べる');
    });

    // B13: a negative citation is the plain negative, not the polite 食べません.
    test('a negative citation is the plain nai-form', () => {
      const tabenai = { ...TABERU, nai: '食べない', nai_reading: 'たべない' };
      expect(predicateSegs(vp(tabenai, { mood: 'infinitive', negative: true }), undefined, undefined)).toEqual([{ t: '食べない', r: 'たべない' }]);
      expect(text(predicateSegs(vp(tabenai, { mood: 'infinitive', modifier: concept(KESSHITE) }), el(np(NEZUMI)), undefined))).toBe('ネズミを決して食べない');
    });

    // A222: a modal-headed citation folds into a modal chain, which closes the citation in the plain
    // form — never the modal written as a word after ことを (食べることをたい).
    test('a modal chain closes the citation in the plain form', () => {
      const cite = (extra: Parameters<typeof vp>[1]) => vp(TABERU, { mood: 'infinitive', ...extra });
      expect(text(predicateSegs(cite({ modals: [modal(TAI)] }), undefined, undefined))).toBe('食べたい');
      expect(text(predicateSegs(cite({ modals: [modal(KOTO_GA_DEKIRU)] }), el(np(NEZUMI)), undefined))).toBe('ネズミを食べることができる');
      expect(text(predicateSegs(cite({ modals: [modal(HITSUYOU_GA_ARU)], negative: true }), undefined, undefined))).toBe('食べる必要がない');
      expect(text(predicateSegs(cite({ modals: [modal(TAI)], negative: true }), undefined, undefined))).toBe('食べたくない');
      expect(text(predicateSegs(cite({ modals: [modal(TAI, ITSUMO)], modifier: concept(HAYAKU) }), undefined, undefined))).toBe('いつも速く食べたい');
      expect(text(predicateSegs(vp(DESU, { mood: 'infinitive', modals: [modal(TAI)] }), undefined, careful))).toBe('慎重でありたい');
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

    // A121: Japanese cannot leave a predicate unspoken, so an elided one is the pro-form そう.
    test('an elided predicate is spoken as そう, in its own tense, polarity and mood', () => {
      const elided = { type: 'predicative' as const, complement: complement(np(SHINCHOU)) };
      expect(predicateSegs(vp(DESU, { elided }), undefined, undefined)).toEqual([{ t: 'そう' }, { t: 'です' }]);
      expect(text(predicateSegs(vp(DESU, { negative: true, tense: 'past', elided }), undefined, undefined))).toBe('そうではありませんでした');
      expect(text(predicateSegs(vp(DESU, { modifier: concept(ITSUMO), elided }), undefined, undefined))).toBe('いつもそうです');
      expect(text(predicateSegs(vp(DESU, { mood: 'imperative', negative: true, elided }), undefined, undefined))).toBe('そうならないでください');
    });
  });
});

import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, PathSpecifier, Specifier } from '@signi/shared';
import type { RubySegment } from '../../types.js';
import { complementSegs } from './complementSegs.js';
import {
  adj, CHAIRO, complement, complements, concept, DENSETSU, el, ERABU, type Forms, group, HAYAKU, HAYASA, HIKARI, HOUHOU, ICHIBA, IE, INU,
  MIZU, NEKO, np, OOKII, SHIAWASE, TAKAI, YOI, vp,
} from './ja.fixtures.js';

const BOU: Forms = { base: '棒', count: 'singular', reading: 'ぼう' };

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });
const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

describe('complementSegs', () => {
  test('renders nothing without complements', () => {
    expect(complementSegs()).toEqual([]);
    expect(complementSegs({})).toEqual([]);
  });

  describe('predicative', () => {
    test('an i-adjective takes its adverbial く-form and no particle', () => {
      expect(complementSegs(complements({ predicative: complement(np(OOKII)) }))).toEqual([{ t: '大きく', r: 'おおきく' }]);
    });

    test('a kana-only i-adjective has no reading to carry onto its く-form', () => {
      expect(complementSegs(complements({ predicative: complement(np({ role: 'adjective', base: 'すごい' })) }))).toEqual([{ t: 'すごく' }]);
    });

    test('a na-adjective drops its な and takes に', () => {
      expect(complementSegs(complements({ predicative: complement(np(SHIAWASE)) }))).toEqual([{ t: '幸せ', r: 'しあわせ' }, { t: 'に' }]);
    });

    test('a noun takes に', () => {
      expect(complementSegs(complements({ predicative: complement(np(DENSETSU)) }))).toEqual([{ t: '伝説', r: 'でんせつ' }, { t: 'に' }]);
    });

    test('a degree adverb leads the adjective', () => {
      expect(text(complementSegs(complements({ predicative: complement(np(SHIAWASE, { degree: 'more' })) })))).toBe('もっと幸せに');
      expect(text(complementSegs(complements({ predicative: complement(np(OOKII, { degree: 'most' })) })))).toBe('最も大きく');
    });

    // 幸せな → 幸せではない, an i-adjective, so it takes the く-form and no に.
    test('a lowered degree negates the adjective into its く-form', () => {
      expect(complementSegs(complements({ predicative: complement(np(SHIAWASE, { degree: 'less' })) })))
        .toEqual([{ t: 'それほど' }, { t: '幸せではなく', r: 'しあわせではなく' }]);
    });

    // B12: "and" chains the te-form (it used to string と, which joins things, not predicates).
    test('a coordination is chained with the te-form or strung with か, and takes に once', () => {
      expect(text(complementSegs(complements({ predicative: complement(el(np(DENSETSU), np(NEKO))) })))).toBe('伝説で猫に');
      expect(text(complementSegs(complements({ predicative: complement(group('or', np(DENSETSU), np(NEKO))) })))).toBe('伝説か猫に');
      expect(complementSegs(complements({ predicative: complement(el(np(OOKII), np(SHIAWASE))) })))
        .toEqual([{ t: '大き', r: 'おおき' }, { t: 'くて' }, { t: '幸せ', r: 'しあわせ' }, { t: 'に' }]);
      // The last conjunct decides the に: an i-adjective's く-form takes none.
      expect(text(complementSegs(complements({ predicative: complement(el(np(SHIAWASE), np(OOKII))) })))).toBe('幸せで大きく');
      expect(text(complementSegs(complements({ predicative: complement(group('or', np(OOKII), np(SHIAWASE))) })))).toBe('大きくか幸せに');
    });

    // A115: a の-adjective takes its bare stem + に, a た-adjective the state as a ように clause.
    test('a の-adjective drops its の before に, and a た-adjective takes 〜ているように', () => {
      expect(complementSegs(complements({ predicative: complement(np({ role: 'adjective', base: '茶色の', reading: 'ちゃいろの' })) })))
        .toEqual([{ t: '茶色', r: 'ちゃいろ' }, { t: 'に' }]);
      expect(complementSegs(complements({ predicative: complement(np({ role: 'adjective', base: '疲れた', reading: 'つかれた' })) })))
        .toEqual([{ t: '疲れて', r: 'つかれて' }, { t: 'いるように' }]);
    });
  });

  describe('the essive object complement', () => {
    const essive: Specifier[] = [{ kind: 'predication', value: 'essive' }];

    // A224: として is no noun, so a na- or の-adjective takes it on its stem, its reading cut the same way.
    test('a na- or の-adjective takes として on its stem; a noun takes it as it stands', () => {
      expect(complementSegs(complements({ objectPredicative: complement(np(SHIAWASE), essive) })))
        .toEqual([{ t: '幸せ', r: 'しあわせ' }, { t: 'として' }]);
      expect(complementSegs(complements({ objectPredicative: complement(np(CHAIRO), essive) })))
        .toEqual([{ t: '茶色', r: 'ちゃいろ' }, { t: 'として' }]);
      expect(text(complementSegs(complements({ objectPredicative: complement(np(DENSETSU), essive) })))).toBe('伝説として');
    });

    // A232: the degree adverb leads the stem, as it leads the factitive's.
    test('a raised or equal degree leads the stem', () => {
      expect(complementSegs(complements({ objectPredicative: complement(np(SHIAWASE, { degree: 'more' }), essive) })))
        .toEqual([{ t: 'もっと' }, { t: '幸せ', r: 'しあわせ' }, { t: 'として' }]);
      expect(text(complementSegs(complements({ objectPredicative: complement(np(CHAIRO, { degree: 'most' }), essive) })))).toBe('最も茶色として');
      expect(text(complementSegs(complements({ objectPredicative: complement(np(SHIAWASE, { degree: 'equally' }), essive) })))).toBe('同じくらい幸せとして');
    });

    // A274: an i-adjective, as it stands, takes the same degree adverb ahead of it; the lowered two drop.
    test('a raised or equal degree leads an i-adjective too, and a lowered one still drops', () => {
      expect(complementSegs(complements({ objectPredicative: complement(np(OOKII, { degree: 'more' }), essive) })))
        .toEqual([{ t: 'もっと' }, { t: '大きい', r: 'おおきい' }, { t: 'として' }]);
      expect(text(complementSegs(complements({ objectPredicative: complement(np(OOKII, { degree: 'most' }), essive) })))).toBe('最も大きいとして');
      expect(text(complementSegs(complements({ objectPredicative: complement(np(OOKII, { degree: 'less' }), essive) })))).toBe('大きいとして');
      expect(text(complementSegs(complements({ objectPredicative: complement(np(OOKII), essive) })))).toBe('大きいとして');
    });
  });

  describe('terminus', () => {
    test('takes に, once for a group', () => {
      expect(complementSegs(complements({ terminus: complement(np(INU)) }))).toEqual([{ t: '犬', r: 'いぬ' }, { t: 'に' }]);
      expect(text(complementSegs(complements({ terminus: complement(el(np(NEKO), np(INU))) })))).toBe('猫と犬に');
    });
  });

  describe('instrumental', () => {
    test('an object instrument takes で', () => {
      expect(complementSegs(complements({ instrumental: complement(np(BOU)) }))).toEqual([{ t: '棒', r: 'ぼう' }, { t: 'で' }]);
    });

    test('a process instrument is its action’s te-form, the noun its を object', () => {
      expect(complementSegs(complements({ instrumental: complement(np(BOU), [abstraction('process')], vp(ERABU)) })))
        .toEqual([{ t: '棒', r: 'ぼう' }, { t: 'を' }, { t: '選んで', r: 'えらんで' }]);
      expect(text(complementSegs(complements({
        instrumental: complement(np(BOU), [abstraction('process')], vp(ERABU, { modifier: concept(HAYAKU) })),
      })))).toBe('棒を速く選んで');
    });

    test('a concept instrument nominalises its action with ことで', () => {
      expect(complementSegs(complements({ instrumental: complement(np(BOU), [abstraction('concept')], vp(ERABU)) })))
        .toEqual([{ t: '棒', r: 'ぼう' }, { t: 'を' }, { t: '選ぶ', r: 'えらぶ' }, { t: 'ことで' }]);
      expect(text(complementSegs(complements({
        instrumental: complement(np(BOU), [abstraction('concept')], vp(ERABU, { modifier: concept(HAYAKU) })),
      })))).toBe('棒を速く選ぶことで');
    });

    test('an action missing a form falls back: te-form to the base, base to nothing', () => {
      const process = (verb: Forms, extra: Parameters<typeof vp>[1] = {}) =>
        text(complementSegs(complements({ instrumental: complement(np(BOU), [abstraction('process')], vp(verb, extra)) })));
      expect(process({ base: '選ぶ' })).toBe('棒を選ぶ');
      expect(process({})).toBe('棒を');
      expect(process(ERABU, { modifier: concept({}) })).toBe('棒を選んで');
      expect(text(complementSegs(complements({ instrumental: complement(np(BOU), [abstraction('concept')], vp({})) })))).toBe('棒をことで');
    });

    test('falls back to the plain で instrument at the object level or without an action', () => {
      expect(text(complementSegs(complements({ instrumental: complement(np(BOU), [abstraction('object')], vp(ERABU)) })))).toBe('棒で');
      expect(text(complementSegs(complements({ instrumental: complement(np(BOU), [abstraction('process')]) })))).toBe('棒で');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative のように', () => {
      expect(text(complementSegs(complements({ manner: complement(np(MIZU)) })))).toBe('水のように');
    });

    test('measure and mode take で', () => {
      expect(text(complementSegs(complements({ manner: complement(np(HAYASA, {}, { adjectives: [adj(TAKAI)] })) })))).toBe('高い速さで');
      expect(text(complementSegs(complements({ manner: complement(np(HOUHOU, {}, { adjectives: [adj(YOI)] })) })))).toBe('良い方法で');
    });

    test('a possessor renders through the noun phrase', () => {
      expect(text(complementSegs(complements({ manner: complement(np(HAYASA, {}, { possessor: np(HIKARI) })) })))).toBe('光の速さで');
    });
  });

  describe('source and direction', () => {
    test('source takes から and direction へ', () => {
      expect(complementSegs(complements({ source: complement(np(IE)) }))).toEqual([{ t: '家', r: 'いえ' }, { t: 'から' }]);
      expect(complementSegs(complements({ direction: complement(np(ICHIBA)) }))).toEqual([{ t: '市場', r: 'いちば' }, { t: 'へ' }]);
    });
  });

  describe('route', () => {
    test('a bare or through route takes を', () => {
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA)) })))).toBe('市場を');
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA), [path('through')]) })))).toBe('市場を');
      // A374: a route asked about a person carries its spelled path in place of を.
      expect(text(complementSegs(complements({ route: { ...complement(np(INU)), link: 'の中を通って' } })))).toBe('犬の中を通って');
      // A377: so does a route through a person in a statement, bare or `through`; a relation keeps its noun.
      expect(text(complementSegs(complements({ route: complement(np(INU)) })))).toBe('犬の中を通って');
      expect(text(complementSegs(complements({ route: complement(np(INU), [path('through')]) })))).toBe('犬の中を通って');
      expect(text(complementSegs(complements({ route: complement(np(INU), [path('under')]) })))).toBe('犬の下を');
    });

    test('a spatial relation puts its relational noun before を', () => {
      expect(complementSegs(complements({ route: complement(np(ICHIBA), [path('under')]) })))
        .toEqual([{ t: '市場', r: 'いちば' }, { t: 'の下', r: 'のした' }, { t: 'を' }]);
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA), [path('over')]) })))).toBe('市場の上を');
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA), [path('around')]) })))).toBe('市場の周りを');
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA), [path('behind')]) })))).toBe('市場の後ろを');
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA), [path('in_front_of')]) })))).toBe('市場の前を');
    });

    // The negative determiner's も replaces を (どの市場も, never どの市場もを).
    test('a no-determined route ends in も instead of を', () => {
      expect(text(complementSegs(complements({ route: complement(np(ICHIBA, { definiteness: 'no' })) })))).toBe('どの市場も');
    });
  });

  describe('locative', () => {
    test('a bare locative takes で', () => {
      expect(complementSegs(complements({ locative: complement(np(IE)) }))).toEqual([{ t: '家', r: 'いえ' }, { t: 'で' }]);
      expect(text(complementSegs(complements({ locative: complement(np(IE), [path('in')]) })))).toBe('家で');
    });

    // A109: the existential いる / ある marks where the subject is with に. A190: so do 住む and
    // 閉じ込める, whose lexemes seed `locative_particle` — the caller passes the particle either way,
    // and it reaches the locative alone.
    test('a caller-given locative particle replaces で, and only on the locative', () => {
      expect(text(complementSegs(complements({ locative: complement(np(IE)) }), 'に'))).toBe('家に');
      expect(text(complementSegs(complements({ locative: complement(np(IE), [path('under')]) }), 'に'))).toBe('家の下に');
      expect(text(complementSegs(complements({ locative: complement(np(IE)), cause: complement(np(NEKO)) }), 'に'))).toBe('家に猫のために');
      expect(text(complementSegs(complements({ locative: complement(np(IE, { definiteness: 'no' })) }), 'に'))).toBe('どの家にも');
      expect(text(complementSegs(complements({ locative: complement(group('or', np(IE), np(ICHIBA))) }), 'に'))).toBe('家か市場に');
      // The route is a different complement and keeps its own を.
      expect(text(complementSegs(complements({ route: complement(np(IE)) }), 'に'))).toBe('家を');
    });

    // A114: a no group closes its circumfix after the particle and the relational noun.
    test('a no group takes も after で, behind the relational noun', () => {
      expect(text(complementSegs(complements({ locative: complement(np(IE, { definiteness: 'no' })) })))).toBe('どの家でも');
      expect(text(complementSegs(complements({ locative: complement(np(IE, { definiteness: 'no' }), [path('under')]) })))).toBe('どの家の下でも');
      expect(text(complementSegs(complements({ predicative: complement(np(DENSETSU, { definiteness: 'no' })) })))).toBe('どの伝説にも');
    });

    test('a spatial relation puts its relational noun before で', () => {
      expect(complementSegs(complements({ locative: complement(np(IE), [path('under')]) })))
        .toEqual([{ t: '家', r: 'いえ' }, { t: 'の下', r: 'のした' }, { t: 'で' }]);
      expect(text(complementSegs(complements({ locative: complement(np(IE), [path('behind')]) })))).toBe('家の後ろで');
    });

    test('a coordinated place takes its particle once', () => {
      expect(text(complementSegs(complements({ locative: complement(group('or', np(IE), np(ICHIBA))) })))).toBe('家か市場で');
    });

    // A176: a place passed through takes the traversal tail を通って, not the で of a plain place. A
    // route keeps its bare を (above), and a caller-given particle wins over it (A190).
    test('a through locative takes を通って, once for a group, with も after it for a no group', () => {
      expect(complementSegs(complements({ locative: complement(np(IE), [path('through')]) })))
        .toEqual([{ t: '家', r: 'いえ' }, { t: 'を通って' }]);
      expect(text(complementSegs(complements({ locative: complement(el(np(IE), np(ICHIBA)), [path('through')]) })))).toBe('家と市場を通って');
      expect(text(complementSegs(complements({ locative: complement(np(IE, { definiteness: 'no' }), [path('through')]) })))).toBe('どの家を通っても');
      expect(text(complementSegs(complements({ locative: complement(np(IE), [path('through')]) }), 'に'))).toBe('家に');
    });

    // A220: a noun can ask for に as a verb does — a direction is no place an act goes on in (反対の
    // 方向に走ります). Plain containment only: a relation keeps its で, `through` its tail, and the
    // verb's own particle still comes first.
    test('a noun seeding locative_particle takes it in plain containment', () => {
      const HOUKOU: Forms = { base: '方向', count: 'singular', reading: 'ほうこう', locative_particle: 'に' };
      expect(complementSegs(complements({ locative: complement(np(HOUKOU)) })))
        .toEqual([{ t: '方向', r: 'ほうこう' }, { t: 'に' }]);
      expect(text(complementSegs(complements({ locative: complement(np(HOUKOU), [path('in')]) })))).toBe('方向に');
      expect(text(complementSegs(complements({ locative: complement(np(HOUKOU, { definiteness: 'no' })) })))).toBe('どの方向にも');
      expect(text(complementSegs(complements({ locative: complement(np(HOUKOU), [path('under')]) })))).toBe('方向の下で');
      expect(text(complementSegs(complements({ locative: complement(np(HOUKOU), [path('through')]) })))).toBe('方向を通って');
      expect(text(complementSegs(complements({ locative: complement(np(HOUKOU)) }), 'に'))).toBe('方向に');
    });
  });

  describe('cause', () => {
    test('the postposition follows the sentiment', () => {
      expect(text(complementSegs(complements({ cause: complement(np(INU)) })))).toBe('犬のために');
      expect(text(complementSegs(complements({ cause: complement(np(INU), [sentiment('neutral')]) })))).toBe('犬のために');
      expect(text(complementSegs(complements({ cause: complement(np(INU), [sentiment('negative')]) })))).toBe('犬のせいで');
      expect(text(complementSegs(complements({ cause: complement(np(INU), [sentiment('positive')]) })))).toBe('犬のおかげで');
    });
  });

  test('complements render in the fixed order, whatever the map order', () => {
    expect(text(complementSegs(complements({
      cause: complement(np(INU)),
      direction: complement(np(ICHIBA)),
      source: complement(np(IE)),
    })))).toBe('家から市場へ犬のために');
    expect(text(complementSegs(complements({
      locative: complement(np(IE)),
      instrumental: complement(np(BOU)),
      terminus: complement(np(INU)),
    })))).toBe('犬に棒で家で');
  });
});

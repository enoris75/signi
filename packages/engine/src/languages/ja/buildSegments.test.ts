import type { CoordConjunction } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { buildSegments } from './buildSegments.js';
import { ANATA, clause, el, IKU, INU, NAKU, NEKO, NEZUMI, np, TABERU, vp } from './ja.fixtures.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

const catEats = clause(np(NEKO), vp(TABERU));
const dogCries = clause(np(INU), vp(NAKU));
const joined = (conjunction: CoordConjunction): string => text(buildSegments({ ...catEats, coordination: { conjunction, clause: dogCries } }));

describe('buildSegments', () => {
  test('a single clause takes the topic は', () => {
    expect(buildSegments(catEats)).toEqual([{ t: '猫', r: 'ねこ' }, { t: 'は' }, { t: '食べます', r: 'たべます' }]);
  });

  // The protasis subject takes the neutral が of a subordinate clause, its verb the たら form.
  test('a conditional leads with もし and the たら clause', () => {
    const phrase = clause(np(INU), vp(NAKU, { mood: 'conditional' }), {
      condition: clause(np(NEKO), vp(TABERU, { mood: 'subjunctive' }), { directObject: el(np(NEZUMI)) }),
    });
    expect(buildSegments(phrase)).toEqual([
      { t: 'もし' }, { t: '猫', r: 'ねこ' }, { t: 'が' }, { t: 'ネズミ' }, { t: 'を' }, { t: '食べたら', r: 'たべたら' }, { t: '、' },
      { t: '犬', r: 'いぬ' }, { t: 'は' }, { t: '泣きます', r: 'なきます' },
    ]);
  });

  test('a coordinated clause closes the first sentence and opens with its connective and a comma, with its own topic', () => {
    expect(joined('and')).toBe('猫は食べます。そして、犬は泣きます');
    expect(joined('or')).toBe('猫は食べます。または、犬は泣きます');
    expect(joined('but')).toBe('猫は食べます。しかし、犬は泣きます');
    expect(joined('that_is')).toBe('猫は食べます。つまり、犬は泣きます');
    expect(joined('therefore')).toBe('猫は食べます。だから、犬は泣きます');
    expect(joined('then')).toBe('猫は食べます。それから、犬は泣きます');
  });

  test('the closing full stop, the connective and its comma are segments of their own', () => {
    expect(buildSegments({ ...catEats, coordination: { conjunction: 'but', clause: dogCries } })).toEqual([
      { t: '猫', r: 'ねこ' }, { t: 'は' }, { t: '食べます', r: 'たべます' }, { t: '。' }, { t: 'しかし' }, { t: '、' },
      { t: '犬', r: 'いぬ' }, { t: 'は' }, { t: '泣きます', r: 'なきます' },
    ]);
  });

  // The instruction register ends each clause on a non-polite 連用形 that stays inside the sentence.
  test('coordinated instructions keep the comma before the connective', () => {
    const eat = clause(np(ANATA), vp(TABERU, { mood: 'imperative', register: 'instruction' }), { directObject: el(np(NEZUMI)) });
    const go = clause(np(ANATA), vp(IKU, { mood: 'imperative', register: 'instruction' }));
    expect(text(buildSegments({ ...eat, coordination: { conjunction: 'then', clause: go } }))).toBe('ネズミを食べ、それから行き');
  });

  test('coordinated commands drop both subjects', () => {
    const eat = clause(np(ANATA), vp(TABERU, { mood: 'imperative' }), { directObject: el(np(NEZUMI)) });
    const go = clause(np(ANATA), vp(IKU, { mood: 'imperative' }));
    expect(text(buildSegments({ ...eat, coordination: { conjunction: 'then', clause: go } }))).toBe('ネズミを食べてください。それから、行ってください');
  });

  test('a coordination follows the whole conditional sentence', () => {
    const phrase = clause(np(INU), vp(NAKU, { mood: 'conditional' }), {
      condition: clause(np(NEKO), vp(TABERU, { mood: 'subjunctive' })),
      coordination: { conjunction: 'and', clause: clause(np(NEKO), vp(IKU)) },
    });
    expect(text(buildSegments(phrase))).toBe('もし猫が食べたら、犬は泣きます。そして、猫は行きます');
  });
});

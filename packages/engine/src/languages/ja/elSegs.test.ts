import { describe, expect, test } from 'vitest';
import { adj, el, group, INU, KITSUNE, NEKO, np, OOKII } from './ja.fixtures.js';
import { elSegs } from './elSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

describe('elSegs', () => {
  test('a single phrase renders as itself', () => {
    expect(elSegs(el(np(NEKO)))).toEqual([{ t: '猫', r: 'ねこ' }]);
  });

  test('and repeats と between every pair, with no comma', () => {
    expect(elSegs(el(np(NEKO), np(INU)))).toEqual([{ t: '猫', r: 'ねこ' }, { t: 'と' }, { t: '犬', r: 'いぬ' }]);
    expect(text(elSegs(el(np(NEKO), np(INU), np(KITSUNE))))).toBe('猫と犬とキツネ');
  });

  test('or joins with か', () => {
    expect(text(elSegs(group('or', np(NEKO), np(INU))))).toBe('猫か犬');
  });

  test('each conjunct keeps its own determiner and adjectives', () => {
    const bigCat = np(NEKO, {}, { adjectives: [adj(OOKII)] });
    expect(text(elSegs(el(bigCat, np(INU, { definiteness: 'this' }))))).toBe('大きい猫とこの犬');
  });
});

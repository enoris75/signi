import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { CHAIRO, DENSETSU, np, OOKII, SHIAWASE, TSUKARETA } from './ja.fixtures.js';
import { predicateLinkSegs } from './predicateLinkSegs.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

// B12: the connective a non-final conjunct of a coordinated predicate takes.
describe('predicateLinkSegs', () => {
  test('"and" is the te-form of each class', () => {
    expect(predicateLinkSegs(np(OOKII), 'te')).toEqual([{ t: '大き', r: 'おおき' }, { t: 'くて' }]);
    expect(text(predicateLinkSegs(np(SHIAWASE), 'te'))).toBe('幸せで');
    expect(text(predicateLinkSegs(np(CHAIRO), 'te'))).toBe('茶色で');
    expect(text(predicateLinkSegs(np(TSUKARETA), 'te'))).toBe('疲れていて');
    expect(text(predicateLinkSegs(np(DENSETSU), 'te'))).toBe('伝説で');
  });

  test('a negation puts も on the same connective', () => {
    expect(text(predicateLinkSegs(np(OOKII), 'mo'))).toBe('大きくも');
    expect(text(predicateLinkSegs(np(SHIAWASE), 'mo'))).toBe('幸せでも');
    expect(text(predicateLinkSegs(np(TSUKARETA), 'mo'))).toBe('疲れても');
    expect(text(predicateLinkSegs(np(DENSETSU), 'mo'))).toBe('伝説でも');
  });

  test('"or" is the plain predicate + か, dropping the non-past だ', () => {
    expect(text(predicateLinkSegs(np(OOKII), 'ka'))).toBe('大きいか');
    expect(text(predicateLinkSegs(np(SHIAWASE), 'ka'))).toBe('幸せか');
    expect(text(predicateLinkSegs(np(TSUKARETA), 'ka'))).toBe('疲れているか');
    expect(text(predicateLinkSegs(np(DENSETSU), 'ka'))).toBe('伝説か');
    expect(text(predicateLinkSegs(np(OOKII), 'ka', true))).toBe('大きかったか');
    expect(text(predicateLinkSegs(np(SHIAWASE), 'ka', true))).toBe('幸せだったか');
    expect(text(predicateLinkSegs(np(TSUKARETA), 'ka', true))).toBe('疲れていたか');
    expect(text(predicateLinkSegs(np(DENSETSU), 'ka', true))).toBe('伝説だったか');
  });

  test('an adjective keeps its degree adverb, and a lowered degree its negative', () => {
    expect(text(predicateLinkSegs(np(OOKII, { degree: 'more' }), 'te'))).toBe('もっと大きくて');
    expect(text(predicateLinkSegs(np(OOKII, { degree: 'less' }), 'te'))).toBe('それほど大きくなくて');
  });
});

import { describe, expect, test } from 'vitest';
import type { ConceptForms, RubySegment } from '../../types.js';
import { DENSETSU, el, np, OOKII, SHIAWASE, TSUKARETA } from './ja.fixtures.js';
import { copularContinuation } from './copularContinuation.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');
const TSUZUKERU: ConceptForms = {
  conceptId: 'CONTINUE_DOING',
  forms: { base: '続ける', reading: 'つづける', masu_present: '続けます', masu_present_reading: 'つづけます', copular_compound: '1' },
};
const continued = (forms: Record<string, string>) => copularContinuation(TSUZUKERU, { phrase: el(np(forms)) });

// A315: 続ける over a copular complement.
describe('copularContinuation', () => {
  test('a noun or な-adjective takes で and compounds on あり', () => {
    const happy = continued(SHIAWASE);
    expect(text(happy.segs)).toBe('幸せで');
    expect(happy.verb.forms).toMatchObject({ base: 'あり続ける', reading: 'ありつづける', masu_present: 'あり続けます' });
    expect(happy.verb.forms['copular_compound']).toBeUndefined();
    expect(text(continued(DENSETSU).segs)).toBe('伝説で');
  });

  test('an い-adjective takes 〜く', () => {
    const big = continued(OOKII);
    expect(big.segs).toEqual([{ t: '大き', r: 'おおき' }, { t: 'く' }]);
    expect(big.verb.forms['masu_present']).toBe('あり続けます');
  });

  test('a た-adjective compounds on いる\'s stem', () => {
    const tired = continued(TSUKARETA);
    expect(text(tired.segs)).toBe('疲れて');
    expect(tired.verb.forms['masu_present']).toBe('い続けます');
  });
});

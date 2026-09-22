import { describe, expect, test } from 'vitest';
import { naiSegs } from './naiSegs.js';

// A03: the ない form a governing modal attaches to.
describe('naiSegs', () => {
  const ikanai = [{ t: '行かない', r: 'いかない' }];

  test('a dict governor attaches straight to the ない form', () => {
    expect(naiSegs(ikanai, 'dict')).toEqual(ikanai);
  });

  // ない is an i-adjective and has no polite stem for 〜たい, so it goes through 〜ないでいる.
  test('a stem governor goes through the 〜ないでい bridge', () => {
    expect(naiSegs(ikanai, 'stem')).toEqual([{ t: '行かない', r: 'いかない' }, { t: 'でい' }]);
  });

  test('the segments handed in are not mutated', () => {
    const segs = [{ t: 'ことができない' }];
    naiSegs(segs, 'stem');
    expect(segs).toEqual([{ t: 'ことができない' }]);
  });
});

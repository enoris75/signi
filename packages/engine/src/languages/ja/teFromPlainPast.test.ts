import { describe, expect, test } from 'vitest';
import { teFromPlainPast } from './teFromPlainPast.js';

describe('teFromPlainPast', () => {
  test('turns the last segment from た to て, and だ to で, in text and reading', () => {
    expect(teFromPlainPast([{ t: '猫' }, { t: 'が' }, { t: '食べた', r: 'たべた' }])).toEqual([
      { t: '猫' }, { t: 'が' }, { t: '食べて', r: 'たべて' },
    ]);
    expect(teFromPlainPast([{ t: '飲んだ', r: 'のんだ' }])).toEqual([{ t: '飲んで', r: 'のんで' }]);
    expect(teFromPlainPast([{ t: '走った' }])).toEqual([{ t: '走って' }]);
  });

  test('the negative なかった becomes なくて, the copula だった で', () => {
    expect(teFromPlainPast([{ t: '食べなかった', r: 'たべなかった' }])).toEqual([{ t: '食べなくて', r: 'たべなくて' }]);
    expect(teFromPlainPast([{ t: '学生' }, { t: 'だった' }])).toEqual([{ t: '学生' }, { t: 'で' }]);
  });

  test('a clause not ending on a past is unchanged', () => {
    const segs = [{ t: '食べる' }];
    expect(teFromPlainPast(segs)).toBe(segs);
    expect(teFromPlainPast([])).toEqual([]);
  });
});

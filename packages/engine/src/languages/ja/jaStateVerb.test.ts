import { describe, expect, test } from 'vitest';
import { jaStateVerb } from './jaStateVerb.js';

const dict = (base: string): string | undefined => {
  const v = jaStateVerb(base);
  return v && `${base.slice(0, -v.cut)}${v.dict}`;
};
const nai = (base: string): string | undefined => {
  const v = jaStateVerb(base);
  return v && `${base.slice(0, -v.cut)}${v.nai}ない`;
};

describe('jaStateVerb', () => {
  test('an ichidan past, a passive among them, reads back as 〜る', () => {
    expect(dict('疲れた')).toBe('疲れる');
    expect(dict('閉じた')).toBe('閉じる');
    expect(dict('去勢された')).toBe('去勢される');
    expect(dict('つかれた')).toBe('つかれる');
    expect(nai('疲れた')).toBe('疲れない');
  });

  test('a compound before した, or と, is a する verb', () => {
    expect(dict('孤立した')).toBe('孤立する');
    expect(dict('整然とした')).toBe('整然とする');
    expect(nai('失敗した')).toBe('失敗しない');
  });

  test('〜いた and 〜いだ are godan く and ぐ', () => {
    expect(dict('開いた')).toBe('開く');
    expect(nai('開いた')).toBe('開かない');
    expect(dict('泳いだ')).toBe('泳ぐ');
    expect(nai('泳いだ')).toBe('泳がない');
  });

  test('an ambiguous past is undefined', () => {
    expect(jaStateVerb('困った')).toBeUndefined();
    expect(jaStateVerb('死んだ')).toBeUndefined();
    expect(jaStateVerb('話した')).toBeUndefined();
    expect(jaStateVerb('来た')).toBeUndefined();
    expect(jaStateVerb('大きい')).toBeUndefined();
  });
});

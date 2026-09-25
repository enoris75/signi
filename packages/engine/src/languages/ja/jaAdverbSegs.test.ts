import { describe, expect, test } from 'vitest';
import { concept } from '../resolved.fixtures.js';
import { jaAdverbSegs } from './jaAdverbSegs.js';

const YOKU = concept({ base: 'よく', subtype: 'frequency' });
const MOU = concept({ base: 'もう', subtype: 'frequency' });
const KESSHITE = concept({ base: '決して', reading: 'けっして', subtype: 'frequency', polarity: 'negative' });
const HAYAKU = concept({ base: '速く', reading: 'はやく' });
const KOKODE = concept({ base: 'ここで', subtype: 'place', locative_ni: 'ここに' });
const UENI = concept({ base: '上に', reading: 'うえに', subtype: 'direction' });
const ISSHONI = { t: '一緒に', r: 'いっしょに' };

const words = (segs: { t: string }[]) => segs.map((s) => s.t);

describe('jaAdverbSegs', () => {
  test('a lone adverb is its word, and none is nothing', () => {
    expect(jaAdverbSegs({ modifier: HAYAKU })).toEqual([{ t: '速く', r: 'はやく' }]);
    expect(jaAdverbSegs({})).toEqual([]);
  });

  // P15: frequency first, then place, direction, manner, the manner nearest the verb.
  test('several adverbs stand in their classes\' order, whatever the primary', () => {
    expect(words(jaAdverbSegs({ modifier: YOKU, moreAdverbs: [HAYAKU, KOKODE] }))).toEqual(['よく', 'ここで', '速く']);
    expect(words(jaAdverbSegs({ modifier: HAYAKU, moreAdverbs: [UENI, KOKODE] }))).toEqual(['ここで', '上に', '速く']);
    expect(words(jaAdverbSegs({ modifier: MOU, moreAdverbs: [YOKU] }))).toEqual(['もう', 'よく']);
    expect(jaAdverbSegs({ modifier: KESSHITE, moreAdverbs: [HAYAKU] })).toEqual([{ t: '決して', r: 'けっして' }, { t: '速く', r: 'はやく' }]);
  });

  test('each place adverb takes the verb\'s locative particle', () => {
    expect(words(jaAdverbSegs({ modifier: YOKU, moreAdverbs: [KOKODE] }, 'に'))).toEqual(['よく', 'ここに']);
  });

  test('a relative clause\'s gap word stands behind the leading frequency adverbs, ahead of the rest', () => {
    expect(words(jaAdverbSegs({ modifier: YOKU, moreAdverbs: [HAYAKU] }, undefined, [ISSHONI]))).toEqual(['よく', '一緒に', '速く']);
    expect(words(jaAdverbSegs({ modifier: HAYAKU }, undefined, [ISSHONI]))).toEqual(['一緒に', '速く']);
    expect(words(jaAdverbSegs({}, undefined, [ISSHONI]))).toEqual(['一緒に']);
  });
});

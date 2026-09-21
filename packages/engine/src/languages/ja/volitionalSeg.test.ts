import { describe, expect, test } from 'vitest';
import { AGERU, concept, IKU, KURU, NOMU, TABERU } from './ja.fixtures.js';
import { volitionalSeg } from './volitionalSeg.js';

describe('volitionalSeg', () => {
  test('an ichidan verb takes よう on its nai-stem', () => {
    expect(volitionalSeg(concept({ ...TABERU, nai: '食べない', nai_reading: 'たべない' }))).toEqual({ t: '食べよう', r: 'たべよう' });
    expect(volitionalSeg(concept({ ...AGERU, nai: 'あげない' }))).toEqual({ t: 'あげよう' });
  });

  test('a godan verb moves its あ-row nai-stem to the お row and takes う', () => {
    expect(volitionalSeg(concept({ ...IKU, nai: '行かない', nai_reading: 'いかない' }))).toEqual({ t: '行こう', r: 'いこう' });
    expect(volitionalSeg(concept({ ...NOMU, nai: '飲まない', nai_reading: 'のまない' }))).toEqual({ t: '飲もう', r: 'のもう' });
    expect(volitionalSeg(concept({ base: '走る', nai: '走らない', nai_reading: 'はしらない' }))).toEqual({ t: '走ろう', r: 'はしろう' });
    // The う-verbs' nai-stem ends on わ, which goes to お.
    expect(volitionalSeg(concept({ base: '買う', nai: '買わない', nai_reading: 'かわない' }))).toEqual({ t: '買おう', r: 'かおう' });
  });

  test('the irregulars take よう, the reading following the nai-form', () => {
    expect(volitionalSeg(concept({ base: '保存する', nai: '保存しない', nai_reading: 'ほぞんしない' }))).toEqual({ t: '保存しよう', r: 'ほぞんしよう' });
    // 来る reads く, but 来ない and 来よう read こ.
    expect(volitionalSeg(concept({ ...KURU, nai: '来ない', nai_reading: 'こない' }))).toEqual({ t: '来よう', r: 'こよう' });
  });

  test('with no nai-form stored there is none', () => {
    expect(volitionalSeg(concept(TABERU))).toBeUndefined();
    // ある's suppletive ない has no stem to build on.
    expect(volitionalSeg(concept({ base: 'ある', nai: 'ない' }))).toBeUndefined();
  });
});

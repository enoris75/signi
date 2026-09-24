import { describe, expect, test } from 'vitest';
import { concept } from '../resolved.fixtures.js';
import { jaModifierSeg } from './jaModifierSeg.js';

const KOKODE = concept({ base: 'ここで', subtype: 'place', locative_ni: 'ここに' });
const DOKODEMO = concept({ base: 'どこでも', subtype: 'place', locative_ni: 'どこにでも' });

describe('jaModifierSeg', () => {
  // Localization B67: a place adverb says its particle, and an existential or 住む wants に.
  test('a place adverb takes its に form where the verb marks its place with に', () => {
    expect(jaModifierSeg(KOKODE, 'に')).toEqual({ t: 'ここに' });
    expect(jaModifierSeg(DOKODEMO, 'に')).toEqual({ t: 'どこにでも' });
  });

  // Localization B89: FAR_AWAY's に form has kanji, so it takes a reading of its own.
  test('a に form with kanji takes its own reading', () => {
    const TOOKUDE = concept({ base: '遠くで', reading: 'とおくで', subtype: 'place', locative_ni: '遠くに', locative_ni_reading: 'とおくに' });
    expect(jaModifierSeg(TOOKUDE, 'に')).toEqual({ t: '遠くに', r: 'とおくに' });
    expect(jaModifierSeg(TOOKUDE, 'で')).toEqual({ t: '遠くで', r: 'とおくで' });
  });

  test('and keeps its で form anywhere else', () => {
    expect(jaModifierSeg(KOKODE)).toEqual({ t: 'ここで' });
    expect(jaModifierSeg(KOKODE, 'で')).toEqual({ t: 'ここで' });
  });

  test('an adverb of another kind, or a place adverb with no に form, is its own word', () => {
    expect(jaModifierSeg(concept({ base: '速く', reading: 'はやく' }), 'に')).toEqual({ t: '速く', r: 'はやく' });
    expect(jaModifierSeg(concept({ base: 'ここで', subtype: 'place' }), 'に')).toEqual({ t: 'ここで' });
    expect(jaModifierSeg(concept({ base: 'ここに', subtype: 'direction', locative_ni: 'x' }), 'に')).toEqual({ t: 'ここに' });
  });

  test('no adverb, or one with no word, is nothing', () => {
    expect(jaModifierSeg(undefined, 'に')).toBeUndefined();
    expect(jaModifierSeg(concept({ base: '' }))).toBeUndefined();
  });
});

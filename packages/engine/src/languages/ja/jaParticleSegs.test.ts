import { describe, expect, test } from 'vitest';
import { el, IE, NEKO, np } from './ja.fixtures.js';
import { jaParticleSegs } from './jaParticleSegs.js';

describe('jaParticleSegs', () => {
  test('an ordinary group takes its particle', () => {
    expect(jaParticleSegs(el(np(IE)), 'で')).toEqual([{ t: 'で' }]);
    expect(jaParticleSegs(el(np(NEKO)), '')).toEqual([]);
  });

  test('a no group\'s も replaces が, を and は', () => {
    expect(jaParticleSegs(el(np(NEKO, { definiteness: 'no' })), 'が')).toEqual([{ t: 'も' }]);
    expect(jaParticleSegs(el(np(NEKO, { definiteness: 'no' })), 'を')).toEqual([{ t: 'も' }]);
    expect(jaParticleSegs(el(np(NEKO, { definiteness: 'no' })), 'は')).toEqual([{ t: 'も' }]);
  });

  test('and follows any other particle', () => {
    expect(jaParticleSegs(el(np(IE, { definiteness: 'no' })), 'で')).toEqual([{ t: 'で' }, { t: 'も' }]);
    expect(jaParticleSegs(el(np(NEKO, { definiteness: 'no' })), 'のために')).toEqual([{ t: 'のために' }, { t: 'も' }]);
  });
});

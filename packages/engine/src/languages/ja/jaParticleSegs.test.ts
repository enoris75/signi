import { describe, expect, test } from 'vitest';
import { adj, el, IE, NEKO, np } from './ja.fixtures.js';
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

  // P09-E36: the plain noun a negated indefinite's adjective stands on takes the case particle, and
  // the negative word follows with its も — を kept, the subject's が as は, any other particle kept.
  test('a negated indefinite with an adjective writes its negative word after the particle', () => {
    const nani = (adjectives = [adj({ base: '大きい', reading: 'おおきい' })]) =>
      el(np({ base: '何', reading: 'なに', person: '3', negative_modified: 'もの', definiteness: 'no' }, {}, { adjectives }));
    expect(jaParticleSegs(nani(), 'を')).toEqual([{ t: 'を' }, { t: '何', r: 'なに' }, { t: 'も' }]);
    expect(jaParticleSegs(nani(), 'が')).toEqual([{ t: 'は' }, { t: '何', r: 'なに' }, { t: 'も' }]);
    expect(jaParticleSegs(nani(), 'に')).toEqual([{ t: 'に' }, { t: '何', r: 'なに' }, { t: 'も' }]);
  });
});

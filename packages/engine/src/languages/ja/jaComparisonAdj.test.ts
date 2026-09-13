import { describe, expect, test } from 'vitest';
import { adj, concept, NEKO, OOKII, SHIAWASE, YOI } from './ja.fixtures.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';

describe('jaComparisonAdj', () => {
  test('keeps the stored base for the plain and raised degrees', () => {
    expect(jaComparisonAdj(adj(OOKII))).toEqual({ base: '大きい', reading: 'おおきい' });
    expect(jaComparisonAdj(adj(OOKII, { degree: 'more' }))).toEqual({ base: '大きい', reading: 'おおきい' });
    expect(jaComparisonAdj(adj(OOKII, { degree: 'most' }))).toEqual({ base: '大きい', reading: 'おおきい' });
  });

  test('a lowered i-adjective takes its plain negative …くない', () => {
    expect(jaComparisonAdj(adj(OOKII, { degree: 'less' }))).toEqual({ base: '大きくない', reading: 'おおきくない' });
    expect(jaComparisonAdj(adj(YOI, { degree: 'least' }))).toEqual({ base: '良くない', reading: 'よくない' });
  });

  test('a lowered na-adjective drops な for ではない', () => {
    expect(jaComparisonAdj(adj(SHIAWASE, { degree: 'less' }))).toEqual({ base: '幸せではない', reading: 'しあわせではない' });
  });

  test('a lowered bare nominal stem takes ではない', () => {
    const shizuka = adj({ role: 'adjective', base: '静か', reading: 'しずか' }, { degree: 'less' });
    expect(jaComparisonAdj(shizuka)).toEqual({ base: '静かではない', reading: 'しずかではない' });
  });

  test('a lowered adjective without a reading stays without one', () => {
    expect(jaComparisonAdj(adj({ role: 'adjective', base: 'すごい' }, { degree: 'less' }))).toEqual({ base: 'すごくない', reading: undefined });
  });

  test('only negates an adjective', () => {
    expect(jaComparisonAdj(concept({ ...NEKO, degree: 'less' }))).toEqual({ base: '猫', reading: 'ねこ' });
  });
});

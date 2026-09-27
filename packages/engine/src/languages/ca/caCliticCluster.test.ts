import { describe, expect, test } from 'vitest';
import { caCliticCluster, clusterAll } from './caCliticCluster.js';

describe('caCliticCluster', () => {
  test('em, et, es take their full form before another pronoun, which reduces', () => {
    expect(caCliticCluster('es', 'el')).toBe("se'l");
    expect(caCliticCluster('em', 'el')).toBe("me'l");
    expect(caCliticCluster('es', 'la')).toBe('se la');
    expect(caCliticCluster('es', 'li')).toBe('se li');
    expect(caCliticCluster('es', 'ens')).toBe("se'ns");
  });

  test('before ho and hi the first elides', () => {
    expect(caCliticCluster('es', 'hi')).toBe("s'hi");
    expect(caCliticCluster('em', 'ho')).toBe("m'ho");
  });

  test('the dative li before a third-person accusative is hi behind it', () => {
    expect(caCliticCluster('li', 'el')).toBe("l'hi");
    expect(caCliticCluster('li', 'la')).toBe('la hi');
    expect(caCliticCluster('li', 'els')).toBe('els hi');
    expect(caCliticCluster('li', 'ho')).toBe('li ho');
  });

  test('any other pair is two words; one alone is itself', () => {
    expect(caCliticCluster('ens', 'el')).toBe('ens el');
    expect(caCliticCluster('', 'el')).toBe('el');
    expect(caCliticCluster('li', '')).toBe('li');
  });
});

describe('clusterAll', () => {
  test('drops the empty ones and clusters a pair', () => {
    expect(clusterAll(['es', '', 'el'])).toBe("se'l");
    expect(clusterAll(['', 'hi'])).toBe('hi');
    expect(clusterAll([])).toBe('');
  });
});

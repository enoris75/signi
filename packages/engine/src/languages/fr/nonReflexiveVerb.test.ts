import { describe, expect, test } from 'vitest';
import { EFFONDRER, MANGER } from './fr.fixtures.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('nonReflexiveVerb', () => {
  test("takes s' off the base and the clitic off every stored form", () => {
    const plain = nonReflexiveVerb({ conceptId: 'COLLAPSE', forms: EFFONDRER });
    expect(plain.forms['base']).toBe('effondrer');
    expect(plain.forms['1sg_future']).toBe('effondrerai');
    expect(plain.forms['1pl_present']).toBe('effondrons');
    expect(plain.forms['2pl_present']).toBe('effondrez');
    expect(plain.forms['3pl_past']).toBe('effondrèrent');
    expect(plain.forms['participle']).toBe('effondré');
    expect(plain.conceptId).toBe('COLLAPSE');
  });

  test('also takes off a full se', () => {
    expect(nonReflexiveVerb({ conceptId: 'RISE', forms: { base: 'se lever', '1sg_present': 'me lève' } }).forms)
      .toEqual({ base: 'lever', '1sg_present': 'lève' });
  });

  test('returns any other verb unchanged', () => {
    const verb = { conceptId: 'EAT', forms: MANGER };
    expect(nonReflexiveVerb(verb)).toBe(verb);
  });
});

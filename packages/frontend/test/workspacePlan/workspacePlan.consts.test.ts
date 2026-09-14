import { describe, expect, it } from 'vitest';
import { COMPLEMENT_TYPES } from '@signi/shared';
import { COMPLEMENT_KEYS, CORE_KEYS } from '../../src/components/PhraseBuilder/workspacePlan/workspacePlan.consts.ts';

describe('the workspacePlan slot keys', () => {
  it('put the subject and direct object at the top level of a plan', () => {
    expect([...CORE_KEYS].sort()).toEqual(['directObject', 'subject']);
  });

  it('put every complement under the plan’s complements, and no core slot', () => {
    expect([...COMPLEMENT_KEYS].sort()).toEqual([...COMPLEMENT_TYPES].sort());
    for (const key of CORE_KEYS) expect(COMPLEMENT_KEYS.has(key)).toBe(false);
  });
});

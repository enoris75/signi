import { describe, expect, it } from 'vitest';
import { COLLAPSIBLE_GROUPS } from '../../src/components/PhraseBuilder/slots.ts';
import { applyCollapse } from '../../src/components/PhraseBuilder/functions/applyCollapse.ts';

const RAW = {
  subjectAdjective: true,
  subjectDefiniteness: true,
  subjectPossessor: true,
  verbTense: true,
  directObjectAdjective: true,
};

describe('applyCollapse', () => {
  it('passes the shown map through untouched while nothing is collapsed', () => {
    const collapsedGroups = {};
    const result = applyCollapse({ rawShownMap: RAW, collapsedGroups, compact: false });

    expect(result.shownMap).toBe(RAW);
    expect(result.effectiveCollapsed).toBe(collapsedGroups);
    expect(result.collapsedMainKeys.size).toBe(0);
  });

  it('hides only the child nodes of the groups the user collapsed', () => {
    const { shownMap, collapsedMainKeys } = applyCollapse({
      rawShownMap: RAW,
      collapsedGroups: { Subject: true, 'Verb Phrase': false },
      compact: false,
    });

    expect(shownMap).toMatchObject({ subjectAdjective: false, subjectDefiniteness: false });
    // The possessor rides the noun's dotted ring, not its word: collapse leaves it be.
    expect(shownMap.subjectPossessor).toBe(true);
    expect(shownMap.verbTense).toBe(true);
    expect(shownMap.directObjectAdjective).toBe(true);
    expect([...collapsedMainKeys]).toEqual(['subject']);
  });

  it('collapses every group in compact view, leaving the manual collapses to come back to', () => {
    const collapsedGroups = { Subject: false, 'Direct Object': true };
    const { shownMap, effectiveCollapsed, collapsedMainKeys } = applyCollapse({
      rawShownMap: RAW,
      collapsedGroups,
      compact: true,
    });

    expect(Object.keys(effectiveCollapsed)).toHaveLength(COLLAPSIBLE_GROUPS.length);
    expect(Object.values(effectiveCollapsed).every(Boolean)).toBe(true);
    expect(collapsedMainKeys).toEqual(new Set(COLLAPSIBLE_GROUPS.map((g) => g.mainKey)));
    expect(shownMap).toMatchObject({ subjectAdjective: false, verbTense: false, directObjectAdjective: false });
    expect(collapsedGroups).toEqual({ Subject: false, 'Direct Object': true });
  });
});

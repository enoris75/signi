import { describe, expect, it, vi } from 'vitest';
import type { Concept } from '@signi/shared';
import { clearableKeys, clearControlsFor } from '../../src/components/PhraseBuilder/functions/clearControls.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const CAT = noun('CAT');
const EAT: Concept = { id: 'EAT', role: 'verb', description: 'EAT', label: 'eat', transitivity: 'transitive' };

const GROUPS = [{ mainKey: 'subject' }, { mainKey: 'verb' }, { mainKey: 'directObject' }];

const clearable = (over: Partial<Parameters<typeof clearableKeys>[0]> = {}) => [
  ...clearableKeys({
    groups: GROUPS,
    selection: { subject: CAT, verb: EAT, directObject: CAT },
    linkTargetKeys: undefined,
    editingSlot: null,
    ...over,
  }),
];

describe('clearableKeys', () => {
  it('offers to clear every chosen word on the canvas', () => {
    expect(clearable()).toEqual(['subject', 'verb', 'directObject']);
    expect(clearable({ selection: { subject: CAT } })).toEqual(['subject']);
  });

  it('offers nothing on a link target’s greyed noun, or on a word open for re-picking', () => {
    expect(clearable({ linkTargetKeys: new Set(['directObject']), editingSlot: 'verb' })).toEqual(['subject']);
  });

  it('offers nothing on a subject a command or an infinitive has replaced', () => {
    expect(clearable({ selection: { subject: CAT, verb: EAT, imperative: true } })).toEqual(['verb']);
    expect(clearable({ selection: { subject: CAT, verb: EAT, infinitive: true } })).toEqual(['verb']);
  });
});

describe('clearControlsFor', () => {
  it('titles each clear button by its slot, and clears that slot', () => {
    const onClear = vi.fn();
    const controls = clearControlsFor({
      clearable: new Set(['subject', 'subject+1']),
      visibleSlots: [{ key: 'subject', label: 'Subject', labelKey: 'slot.subject' }],
      onClear,
    });

    expect(controls).toMatchObject([
      { mainKey: 'subject', label: 'Subject', labelKey: 'slot.subject' },
      // A word with no slot of its own is titled by its key.
      { mainKey: 'subject+1', label: 'subject+1', labelKey: undefined },
    ]);
    controls[0].onClear();
    expect(onClear).toHaveBeenCalledExactlyOnceWith('subject');
  });
});

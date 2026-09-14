import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  renderedSlotsFor,
  roleSlotFor,
  visibleSlotsFor,
} from '../../src/components/PhraseBuilder/functions/visibleSlots.ts';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };
const EAT: Concept = { id: 'EAT', role: 'verb', description: 'EAT', label: 'eat', transitivity: 'transitive' };

const keys = (slots: { key: string }[]) => slots.map((s) => s.key);

describe('roleSlotFor', () => {
  it('dresses a conjunct’s head as the role it shares', () => {
    expect(roleSlotFor({ kind: 'conjunct', role: 'directObject' })).toMatchObject({
      label: 'Direct Object',
      labelKey: 'slot.directObject',
      color: 'success',
    });
  });

  it('names an owner’s head for what it is, in its noun’s colour', () => {
    expect(roleSlotFor({ kind: 'owner', role: 'directObject' })).toEqual({
      label: 'Possessor',
      labelKey: 'slot.possessor',
      required: false,
      color: 'success',
    });
  });

  it('dresses nothing for a builder with no host', () => {
    expect(roleSlotFor(undefined)).toBeUndefined();
  });
});

describe('visibleSlotsFor', () => {
  it('shows no object before a verb is chosen', () => {
    expect(keys(visibleSlotsFor({ subject: CAT }, undefined))).not.toContain('directObject');
    expect(keys(visibleSlotsFor({ subject: CAT, verb: EAT }, undefined))).toContain('directObject');
  });

  it('wears the role slot on the subject, and only there', () => {
    const slots = visibleSlotsFor({ subject: CAT }, roleSlotFor({ kind: 'owner', role: 'directObject' }));

    expect(slots.find((s) => s.key === 'subject')).toMatchObject({
      key: 'subject',
      label: 'Possessor',
      required: false,
      color: 'success',
      // The rest of the slot is still the subject's.
      roles: ['pronoun', 'noun'],
    });
    expect(slots.find((s) => s.key === 'verb')?.label).toBe('Verb');
  });
});

describe('renderedSlotsFor', () => {
  it('renders a revealable slot only while it is shown', () => {
    const visible = visibleSlotsFor({ subject: CAT, verb: EAT }, undefined);

    expect(keys(renderedSlotsFor(visible, {}))).toEqual(['subject', 'verb']);
    expect(keys(renderedSlotsFor(visible, { directObject: true, subjectAdjective: true }))).toEqual([
      'subjectAdjective',
      'subject',
      'verb',
      'directObject',
    ]);
  });
});

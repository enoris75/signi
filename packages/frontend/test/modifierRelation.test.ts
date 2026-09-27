import { describe, expect, it } from 'vitest';
import type { Concept, PhrasePlan } from '@signi/shared';
import {
  defaultModifierRelation,
  slotModifierRelation,
} from '@signi/phrase/model/functions/modifierRelation.ts';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { modifiers } from '../src/components/PhraseBuilder/selectionToPlan/functions/modifiers.ts';
import {
  applyConceptSelect,
  cycleModifierRelation,
  setModifierRelation,
} from '../src/components/PhraseBuilder/phraseReducers.ts';
import type { PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';

// The noun modifier's relation when the author sets none (P14, P16): the pair's, by the head itself or
// its nearest class; else the word's own; else `feature`. Concepts as the API serves them.
const noun = (id: string, extra: Partial<Concept> = {}): Concept => ({ id, role: 'noun', description: id, ...extra });

const TIME = noun('TIME', {
  modifierRelation: 'domain',
  modifierRelationByHead: { DEVICE: 'feature', EVENT: 'feature', QUANTITY: 'material' },
});
const WOOD = noun('WOOD', { modifierRelation: 'material' });
const SAIL = noun('SAIL');
const FLY = noun('FLY_INSECT', { classes: ['ANIMAL'] });
const BOMB = noun('BOMB', { classes: ['DEVICE', 'OBJECT_THING', 'THING'] });
const UNIT = noun('UNIT', { classes: ['QUANTITY'] });
const BOAT = noun('BOAT');

describe('defaultModifierRelation', () => {
  it('is feature for a word with no relation of its own, or no word at all', () => {
    expect(defaultModifierRelation(SAIL, BOAT)).toBe('feature');
    expect(defaultModifierRelation(undefined, BOAT)).toBe('feature');
  });

  it("is the word's own where the head names nothing, or there is no head", () => {
    expect(defaultModifierRelation(TIME, FLY)).toBe('domain');
    expect(defaultModifierRelation(TIME, undefined)).toBe('domain');
    expect(defaultModifierRelation(WOOD, BOMB)).toBe('material');
  });

  it("is the pair's where the head's class is named", () => {
    expect(defaultModifierRelation(TIME, BOMB)).toBe('feature');
    expect(defaultModifierRelation(TIME, UNIT)).toBe('material');
  });

  it('takes the head itself before its class, and a nearer class before a farther one', () => {
    const byWord = noun('TIME', { modifierRelationByHead: { BOMB: 'purpose', DEVICE: 'feature' } });
    expect(defaultModifierRelation(byWord, BOMB)).toBe('purpose');
    const byClass = noun('TIME', { modifierRelationByHead: { THING: 'material', DEVICE: 'feature' } });
    expect(defaultModifierRelation(byClass, BOMB)).toBe('feature');
  });
});

describe('an unset noun modifier', () => {
  const fly: PhraseSelection = { subject: FLY, subjectAdjective: TIME };

  it('plans the pair’s relation, and an explicit one wins', () => {
    expect(modifiers(fly, 'subject').nounModifiers).toEqual([{ concept: 'TIME', relation: 'domain' }]);
    expect(modifiers({ subject: BOMB, subjectAdjective: TIME }, 'subject').nounModifiers).toEqual([
      { concept: 'TIME', relation: 'feature' },
    ]);
    const set = { ...fly, modifierRelations: { subjectAdjective: 'feature' as const } };
    expect(modifiers(set, 'subject').nounModifiers).toEqual([{ concept: 'TIME', relation: 'feature' }]);
  });

  it('reads the head of its own block', () => {
    const sel: PhraseSelection = { subject: FLY, directObject: BOMB, subjectAdjective: TIME, directObjectAdjective: TIME };
    expect(slotModifierRelation(sel, 'subjectAdjective')).toBe('domain');
    expect(slotModifierRelation(sel, 'directObjectAdjective')).toBe('feature');
  });

  it('starts R and Shift+R from the relation it renders with', () => {
    // domain is the last of the four, so R wraps to feature and Shift+R steps back to material.
    expect(cycleModifierRelation(fly, 'subjectAdjective').modifierRelations).toEqual({ subjectAdjective: 'feature' });
    expect(cycleModifierRelation(fly, 'subjectAdjective', -1).modifierRelations).toEqual({ subjectAdjective: 'material' });
    const bomb: PhraseSelection = { subject: BOMB, subjectAdjective: TIME };
    expect(cycleModifierRelation(bomb, 'subjectAdjective').modifierRelations).toEqual({ subjectAdjective: 'purpose' });
  });

  it('forgets a relation set for the word it replaces', () => {
    const set = setModifierRelation({ subject: BOAT, subjectAdjective: SAIL }, 'subjectAdjective', 'purpose');
    const next = applyConceptSelect(set, 'subjectAdjective', TIME);
    expect(slotModifierRelation(next, 'subjectAdjective')).toBe('domain');
  });

  it('keeps the relation set for the same word placed again, and others’ relations', () => {
    const set = setModifierRelation(
      { subject: BOAT, subjectAdjective: TIME, directObject: BOAT, directObjectAdjective: SAIL },
      'subjectAdjective',
      'purpose',
    );
    const both = setModifierRelation(set, 'directObjectAdjective', 'material');
    expect(applyConceptSelect(both, 'subjectAdjective', TIME).modifierRelations).toEqual(both.modifierRelations);
    expect(applyConceptSelect(both, 'subjectAdjective', WOOD).modifierRelations).toEqual({ directObjectAdjective: 'material' });
  });

  it('follows its head, where a set one stays', () => {
    // The canvas drops a block's adjectives with its head, so only a selection that keeps them — the
    // console's apply, a loaded phrase — shows it: the unset slot is re-read against the new head.
    expect(slotModifierRelation({ ...fly, subject: BOMB }, 'subjectAdjective')).toBe('feature');
    const set = setModifierRelation(fly, 'subjectAdjective', 'purpose');
    expect(slotModifierRelation({ ...set, subject: BOMB }, 'subjectAdjective')).toBe('purpose');
  });
});

describe('plan → canvas', () => {
  const CONCEPTS: Record<string, Concept> = {
    TIME, FLY_INSECT: FLY, BOMB, EAT: { id: 'EAT', role: 'verb', description: 'eat', transitivity: 'intransitive' },
  };
  const back = (head: string, relation: 'feature' | 'domain') => {
    const plan: PhrasePlan = {
      subject: { concept: head, definiteness: 'definite', nounModifiers: [{ concept: 'TIME', relation }] },
      verbPhrase: { verb: 'EAT' },
    };
    return planToWorkspace(plan, (id) => CONCEPTS[id]).containers[0]!.selection;
  };

  it('stores a relation only where it differs from the pair’s own', () => {
    expect(back('FLY_INSECT', 'domain').modifierRelations).toBeUndefined();
    expect(back('FLY_INSECT', 'feature').modifierRelations).toEqual({ subjectAdjective: 'feature' });
    expect(back('BOMB', 'feature').modifierRelations).toBeUndefined();
    expect(back('BOMB', 'domain').modifierRelations).toEqual({ subjectAdjective: 'domain' });
  });
});

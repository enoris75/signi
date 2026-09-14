import { describe, expect, it } from 'vitest';
import type { Concept, Transitivity } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import { getActiveSlots } from '../../src/components/PhraseBuilder/slots.ts';
import { nextActiveSlot } from '../../src/components/PhraseBuilder/functions/nextActiveSlot.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const verb = (id: string, transitivity: Transitivity, extra: Partial<Concept> = {}): Concept => ({
  id,
  role: 'verb',
  description: id,
  label: id,
  transitivity,
  ...extra,
});
const adjective = (id: string): Concept => ({ id, role: 'adjective', description: id, label: id });

const CAT = noun('CAT');
const MOUSE = noun('MOUSE');
const EAT = verb('EAT', 'transitive');
const SLEEP = verb('SLEEP', 'intransitive');
const BIG = adjective('BIG');

// The slots a period shows, as the builder works them out: no objects before a verb is chosen.
const visibleSlotsOf = (selection: PhraseSelection) =>
  getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
    Boolean(selection.subjectAdjective),
    selection.verb?.complements,
  ).filter((s) => selection.verb || !s.key.startsWith('directObject'));

const pick = (slot: Parameters<typeof nextActiveSlot>[0]['slot'], concept: Concept, selection: PhraseSelection) =>
  nextActiveSlot({ slot, concept, selection, visibleSlots: visibleSlotsOf(selection) });

describe('nextActiveSlot', () => {
  describe('after a verb', () => {
    it('goes back for the subject while there is none', () => {
      expect(pick('verb', EAT, {})).toBe('subject');
    });

    it('goes on to the object the new verb takes', () => {
      expect(pick('verb', EAT, { subject: CAT })).toBe('directObject');
    });

    it('reads the slots from the verb just picked, not the one it replaces', () => {
      // The period still holds an intransitive verb, which shows no object box.
      expect(pick('verb', EAT, { subject: CAT, verb: SLEEP })).toBe('directObject');
    });

    it('closes the picker when the verb takes nothing more', () => {
      expect(pick('verb', SLEEP, { subject: CAT })).toBeNull();
    });

    it('skips a filled object, and the complements, which open from the verb phrase', () => {
      const PUT = verb('PUT', 'transitive', { complements: ['locative'] });
      expect(pick('verb', PUT, { subject: CAT, directObject: MOUSE })).toBeNull();
    });

    it('goes to the object, not a subject a command or an infinitive has dropped', () => {
      expect(pick('verb', EAT, { imperative: true })).toBe('directObject');
      expect(pick('verb', EAT, { infinitive: true })).toBe('directObject');
    });
  });

  it('closes the picker after an adjective or a modal, whose next link opens from its own box', () => {
    expect(pick('subjectAdjective', BIG, { subject: CAT })).toBeNull();
    expect(pick('directObjectAdjective2', BIG, { subject: CAT, verb: EAT })).toBeNull();
    expect(pick('verbModal', verb('WANT', 'transitive', { modal: true }), { subject: CAT, verb: EAT })).toBeNull();
  });

  it('goes on to the next empty main slot after any other word', () => {
    expect(pick('subject', CAT, {})).toBe('verb');
    expect(pick('subject', CAT, { verb: EAT })).toBe('directObject');
  });

  it('leaves focus where it is when every slot after the word is filled', () => {
    expect(pick('subject', CAT, { verb: EAT, directObject: MOUSE })).toBeUndefined();
    expect(pick('directObject', MOUSE, { subject: CAT, verb: EAT })).toBeUndefined();
  });
});

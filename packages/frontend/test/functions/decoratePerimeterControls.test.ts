import { describe, expect, it, vi } from 'vitest';
import { UI_STRINGS, type Concept, type UiStringKey } from '@signi/shared';
import type { SatelliteIcon } from '../../src/components/PhraseBuilder/Boxes.tsx';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import type { PerimeterEntry } from '../../src/components/PhraseBuilder/satellites/index.ts';
import { decoratePerimeterControls } from '../../src/components/PhraseBuilder/functions/decoratePerimeterControls.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id.toLowerCase() });

const PETER = noun('PETER');
const PAUL = noun('PAUL');
const CAT = noun('CAT');

const icon = (key: string, extra: Partial<SatelliteIcon> = {}): SatelliteIcon => ({
  key,
  icon: null,
  label: key,
  active: false,
  isSet: false,
  valued: true,
  onToggle: () => {},
  ...extra,
});

// The catalog's English, as `t` reads it before the bundle arrives.
const t = (key: UiStringKey) => UI_STRINGS[key].fallback;
// The concept's word in the UI language, as `useConceptLabel` gives it.
const word = (concept: Concept) => concept.label ?? concept.id;

const conjunct = (which: string) => icon(`${which}Conjunct`, { valueLabel: 'Add a conjunct' });
const possessor = (which: string) => icon(`${which}Possessor`, { active: true, valued: false });

const perimeter = (): Partial<Record<'subject' | 'directObject', PerimeterEntry>> => ({
  subject: { conjunct: conjunct('subject'), possessor: possessor('subject') },
  directObject: { conjunct: conjunct('directObject'), possessor: possessor('directObject') },
});

const decorate = (
  selection: PhraseSelection,
  extra: Partial<Parameters<typeof decoratePerimeterControls>[0]> = {},
) =>
  decoratePerimeterControls({
    perimeterByNoun: perimeter(),
    selection,
    ringHost: undefined,
    resolve: () => undefined,
    onTogglePossessor: () => {},
    t,
    word,
    possessivePhrase: () => undefined,
    ...extra,
  });

describe('decoratePerimeterControls', () => {
  describe('the control that extends a group', () => {
    it('leaves a head that stands alone, and moves off one that has conjuncts', () => {
      const result = decorate({ subject: PETER, subjectConjuncts: [{ subject: PAUL }], directObject: CAT });

      expect(result.subject?.conjunct).toBeUndefined();
      expect(result.subject?.possessor).toBeDefined();
      expect(result.directObject?.conjunct).toMatchObject({ key: 'directObjectConjunct', valueLabel: 'Add a conjunct' });
    });

    it('rides the last conjunct’s ring, reading as adding another', () => {
      const result = decorate({ subject: PAUL }, { ringHost: { kind: 'conjunct', isLast: true } });

      expect(result.subject?.conjunct).toMatchObject({ isSet: true, valueLabel: 'Add another conjunct' });
    });

    it('is left off an earlier conjunct and off an owner', () => {
      expect(decorate({ subject: PAUL }, { ringHost: { kind: 'conjunct', isLast: false } }).subject?.conjunct).toBeUndefined();
      expect(decorate({ subject: CAT }, { ringHost: { kind: 'owner' } }).subject?.conjunct).toBeUndefined();
    });
  });

  describe('the possessor control', () => {
    it('toggles its own noun’s owner', () => {
      const onTogglePossessor = vi.fn();
      const result = decorate({ subject: PETER, directObject: CAT }, { onTogglePossessor });

      result.directObject?.possessor?.onToggle();

      expect(onTogglePossessor).toHaveBeenCalledExactlyOnceWith('directObject');
    });

    it('keeps its own look while the owner is named, or not yet chosen', () => {
      const result = decorate({ subject: PETER, subjectPossessor: { subject: CAT } });

      expect(result.subject?.possessor?.active).toBe(true);
      expect(result.subject?.possessor?.valueLabel).toBeUndefined();
    });

    it('says which noun it points to, and the pronoun that renders', () => {
      const resolve = vi.fn(() => ({
        concept: PETER,
        features: { kind: 'pronominal' as const, person: '3' as const, number: 'singular' as const, gender: 'masc' as const },
      }));
      const result = decorate({ subject: PETER, directObject: CAT, directObjectPossessorRef: 'subject' }, { resolve });

      expect(resolve).toHaveBeenCalledWith('subject');
      expect(result.directObject?.possessor).toMatchObject({
        active: false,
        valueLabel: 'peter (“his”) — click to remove',
      });
    });

    it('quotes the whole possessed phrase once the backend has rendered it', () => {
      // "la sua casa", not the bare "suo": the Romance possessive agrees with what is possessed,
      // which no catalog entry can know in advance (C16).
      const resolve = () => ({
        concept: PETER,
        features: { kind: 'pronominal' as const, person: '3' as const, number: 'singular' as const, gender: 'masc' as const },
      });
      const result = decorate(
        { subject: PETER, directObject: CAT, directObjectPossessorRef: 'subject' },
        { resolve, possessivePhrase: (concept) => (concept === CAT.id ? 'his cat' : undefined) },
      );

      expect(result.directObject?.possessor?.valueLabel).toBe('peter (“his cat”) — click to remove');
    });

    it('still offers removal when the noun it points to cannot be resolved', () => {
      const result = decorate({ subject: PETER, directObject: CAT, directObjectPossessorRef: 'subject' });

      expect(result.directObject?.possessor?.valueLabel).toBe('a noun — click to remove');
    });
  });

  it('leaves the controls it was handed as they were', () => {
    const perimeterByNoun = perimeter();
    const subject = perimeterByNoun.subject!;
    const { conjunct, possessor } = subject;

    decoratePerimeterControls({
      perimeterByNoun,
      selection: { subject: PETER, subjectConjuncts: [{ subject: PAUL }], subjectPossessorRef: 'directObject' },
      ringHost: { kind: 'conjunct', isLast: true },
      resolve: () => undefined,
      onTogglePossessor: () => {},
      t,
      word,
      possessivePhrase: () => undefined,
    });

    expect(perimeterByNoun.subject).toBe(subject);
    expect(subject.conjunct).toBe(conjunct);
    expect(subject.possessor).toBe(possessor);
    expect(possessor?.active).toBe(true);
    expect(possessor?.valueLabel).toBeUndefined();
  });
});

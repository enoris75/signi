import { describe, expect, it, vi } from 'vitest';
import type { UiStringKey } from '@signi/shared';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import {
  clearTitle,
  collapseTitle,
  removeTitle,
  revealTitle,
} from '../src/components/PhraseBuilder/canvasCommands.ts';
import { roleGroups } from '../src/components/PhraseBuilder/graph.ts';
import type { SlotConfig } from '../src/components/PhraseBuilder/interfaces.ts';
import { buildSatelliteIcons } from '../src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts';
import { rawSatellites } from '../src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx';
import {
  passiveCaptions,
  roleSlotFor,
} from '../src/components/PhraseBuilder/functions/visibleSlots.ts';
import { ALL_SLOTS, COORDINABLE_NOUN_KEYS, NOUN_KEYS } from '../src/components/PhraseBuilder/slots.ts';

// Every UI string reads as its own key, so a title shows which catalog entry it came from — and an
// English fallback shows up as the only title that is not a key.
const t = (key: UiStringKey) => key;

describe('the canvas controls’ titles', () => {
  it('clears a part by its catalog command, or by its English label when the part has none', () => {
    expect(clearTitle(t, 'Adjective', 'category.adjective')).toBe('action.clear.adjective');
    expect(clearTitle(t, 'Relative clause', 'satellite.relative')).toBe('Clear Relative clause');
    expect(clearTitle(t, 'Adjective')).toBe('Clear Adjective');
  });

  it('shows a part while it is hidden and hides it while it is shown', () => {
    expect(revealTitle(t, false, 'Tense', 'satellite.tense')).toBe('action.show.tense');
    expect(revealTitle(t, true, 'Tense', 'satellite.tense')).toBe('action.hide.tense');
    expect(revealTitle(t, true, 'Number', 'satellite.number')).toBe('Hide Number');
  });

  it('expands a ring while it is collapsed and compacts it while it is not', () => {
    expect(collapseTitle(t, true, 'Subject', 'slot.subject')).toBe('action.expand.subject');
    expect(collapseTitle(t, false, 'Subject', 'slot.subject')).toBe('action.compact.subject');
  });

  // A15 put the control's words on COMPACT (the seeded COLLAPSE is "fall down"), so the English
  // reads the same whichever path renders it.
  it('says "Compact", as the catalog does, on a ring no family names', () => {
    expect(collapseTitle(t, false, 'Possessor', 'slot.possessor')).toBe('Compact Possessor');
    expect(collapseTitle(t, true, 'Possessor', 'slot.possessor')).toBe('Expand Possessor');
  });

  it('removes a boxed complement by its catalog command', () => {
    expect(removeTitle(t, 'Source', 'slot.source')).toBe('action.remove.source');
    expect(removeTitle(t, 'Subject', 'slot.subject')).toBe('Remove Subject');
  });

  // A01's passive gave the subject's box and ring a caption of their own, and the voice satellite a
  // box; neither was in a family, so both spoke English in every language (A19).
  it('names the passive’s agent and the voice box', () => {
    expect(clearTitle(t, 'Agent', 'slot.agent')).toBe('action.clear.agent');
    expect(collapseTitle(t, false, 'Agent', 'slot.agent')).toBe('action.compact.agent');
    expect(collapseTitle(t, true, 'Agent', 'slot.agent')).toBe('action.expand.agent');
    expect(revealTitle(t, false, 'Voice', 'satellite.voice')).toBe('action.show.voice');
    expect(revealTitle(t, true, 'Voice', 'satellite.voice')).toBe('action.hide.voice');
  });
});

// The guard. A control falls back to `${verb} ${label}` when its `labelKey` names no part the
// family covers, which renders English in every UI language and fails nothing. So every key a
// control can carry is walked here, from the same sources the canvas takes them from, and each
// must resolve to a catalog command.
describe('every part a canvas control acts on is named by the catalog', () => {
  // The titles that fell back to English, as "<labelKey>: <title>".
  const english = (controls: readonly { labelKey?: UiStringKey }[], title: (key?: UiStringKey) => string) =>
    [...new Set(controls.map((c) => c.labelKey))]
      .map((key) => [key, title(key)] as const)
      .filter(([, text]) => !text.startsWith('action.'))
      .map(([key, text]) => `${key}: ${text}`);

  // Every caption a word box can wear: its own, the passive's, and a hosted ring's dressing — a
  // conjunct's head plays its group's role, an owner's head is the possessor of any noun.
  const boxCaptions: Pick<SlotConfig, 'label' | 'labelKey'>[] = [
    ...ALL_SLOTS,
    ...ALL_SLOTS.map(passiveCaptions),
    ...COORDINABLE_NOUN_KEYS.map((role) => roleSlotFor({ kind: 'conjunct', role })!),
    ...NOUN_KEYS.map((role) => roleSlotFor({ kind: 'owner', role })!),
    // The standard's ring, under a rival's degree and a superlative's (P09-E51 D2).
    roleSlotFor({ kind: 'standard', role: 'predicative' })!,
    roleSlotFor({ kind: 'standard', role: 'predicative', set: true })!,
    // A noun's examples' ring (P09-E48).
    roleSlotFor({ kind: 'examples', role: 'subject' })!,
  ];

  // Every ring the period canvas draws, with everything shown, in both voices.
  const rings = [false, true].flatMap((passive) =>
    roleGroups({
      drawCanvas: true,
      showSubject: true,
      visibleSlots: ALL_SLOTS,
      shownMap: Object.fromEntries(ALL_SLOTS.map((s) => [s.key, true])),
      passive,
    }),
  );

  // Every satellite control whose tooltip offers to show or hide a box, as buildSatelliteIcons
  // sorts them: all of them available and their boxes shown, which is when a control offers to
  // hide one. A direct toggle (number, gender, polarity) is never shown, a link (the instrumental,
  // the relative clause) and the coordination control never active, so neither kind is here.
  const revealControls = (): SatelliteIcon[] => {
    const satellites = rawSatellites({}, 'en', t).map((s) => ({
      ...s,
      available: true,
      shown: !s.directToggle,
    }));
    const icons = buildSatelliteIcons({
      satellites,
      shownMap: Object.fromEntries(satellites.map((s) => [s.key, s.shown])),
      collapsedMainKeys: new Set(),
      linkBinding: undefined,
      onToggleNumber: vi.fn(),
      onToggleGender: vi.fn(),
      onToggleNegative: vi.fn(),
      onToggleReveal: vi.fn(),
      onAddConjunct: vi.fn(),
      t,
    });
    return [
      ...Object.values(icons.satelliteIconsByParent).flat(),
      ...icons.complementToggleIcons,
      ...Object.values(icons.perimeterByNoun).flatMap((e) => [e.relative, e.possessor, e.conjunct, e.standard, e.examples]),
      icons.directObjectToggle,
    ].filter((icon): icon is SatelliteIcon => Boolean(icon && icon.active && !icon.link));
  };

  it('on every word box’s clear button', () => {
    expect(english(boxCaptions, (key) => clearTitle(t, '…', key))).toEqual([]);
  });

  it('on every ring’s collapse toggle, in the active and in the passive', () => {
    expect(rings.map((r) => r.labelKey)).toContain('slot.agent');
    expect(english(rings, (key) => collapseTitle(t, false, '…', key))).toEqual([]);
    expect(english(rings, (key) => collapseTitle(t, true, '…', key))).toEqual([]);
  });

  it('on every complement ring’s remove button', () => {
    const removable = rings.filter((r) => r.removeKey);
    expect(removable.length).toBeGreaterThan(0);
    expect(english(removable, (key) => removeTitle(t, '…', key))).toEqual([]);
  });

  it('on every satellite control that shows and hides a box', () => {
    const controls = revealControls();
    expect(controls.map((c) => c.key)).toContain('verbVoice');
    // A control with no key has nothing to name its part by: it must be one of the kinds above.
    expect(controls.filter((c) => !c.labelKey).map((c) => c.key)).toEqual([]);
    expect(english(controls, (key) => revealTitle(t, true, '…', key))).toEqual([]);
    expect(english(controls, (key) => revealTitle(t, false, '…', key))).toEqual([]);
  });
});

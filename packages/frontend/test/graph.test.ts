import { describe, expect, it } from 'vitest';
import { linkEdge, roleGroups } from '../src/components/PhraseBuilder/graph.ts';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';

describe('linkEdge', () => {
  it('draws a straight line between a link’s ends', () => {
    expect(linkEdge({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 } }, 'blue', false)).toEqual({
      x1: 1,
      y1: 2,
      x2: 3,
      y2: 4,
      color: 'blue',
      dashed: false,
    });
  });

  it('bows a line through its link’s bend', () => {
    expect(linkEdge({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 }, via: { x: 5, y: 6 } }, 'green', true)).toEqual({
      x1: 1,
      y1: 2,
      x2: 3,
      y2: 4,
      via: { x: 5, y: 6 },
      color: 'green',
      dashed: true,
    });
  });
});

describe('roleGroups', () => {
  const rings = (passive: boolean) =>
    roleGroups({ drawCanvas: true, showSubject: true, visibleSlots: ALL_SLOTS, shownMap: { directObject: true }, passive })
      .map((g) => [g.label, g.labelKey, g.mainKey]);

  // A19. The label is what a ring's collapse state is stored under: renamed "Agent", the agent's ring
  // folded nothing, and the patient's, renamed "Subject", folded the agent's satellites.
  it('captions a passive’s rings by the roles they play, under the names they are stored by', () => {
    // Every slot visible: the interjection's ring too (P09-E47), and the vocative's (P11-E8), which a
    // passive does not rename.
    expect(rings(false)).toEqual([
      ['Interjection', 'slot.interjection', 'interjection'],
      ['Vocative', 'slot.vocative', 'vocative'],
      ['Subject', 'slot.subject', 'subject'],
      ['Verb Phrase', 'slot.verbPhrase', 'verb'],
      ['Direct Object', 'slot.directObject', 'directObject'],
    ]);
    expect(rings(true)).toEqual([
      ['Interjection', 'slot.interjection', 'interjection'],
      ['Vocative', 'slot.vocative', 'vocative'],
      ['Subject', 'slot.agent', 'subject'],
      ['Verb Phrase', 'slot.verbPhrase', 'verb'],
      ['Direct Object', 'slot.subject', 'directObject'],
    ]);
  });

  // P11-E8: the vocative stands outside the clause — its ring carries the noun's controls, but no line
  // joins it to the verb phrase.
  it('draws the vocative detached from the clause', () => {
    const vocative = roleGroups({ drawCanvas: true, visibleSlots: ALL_SLOTS, shownMap: {} }).find((g) => g.mainKey === 'vocative');
    expect(vocative).toMatchObject({ label: 'Vocative', detached: true });
    expect(vocative).not.toHaveProperty('bare');
  });
});

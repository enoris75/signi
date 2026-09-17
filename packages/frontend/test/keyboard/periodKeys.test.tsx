import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import type { Concept, GrammaticalRole } from '@signi/shared';
import type {
  PhraseContainer,
  PhraseLink,
} from '../../src/components/PhraseBuilder/interfaces.ts';
import { PhraseWorkspace } from '../../src/components/PhraseBuilder/PhraseWorkspace.tsx';
import { KeyboardProvider } from '../../src/keyboard/KeyboardProvider.tsx';
import { renderWithProviders } from '../render.tsx';

// jsdom has no ResizeObserver, no layout, and no pointer capture; the canvas reads all three.
vi.mock('../../src/components/PhraseBuilder/hooks/useElementSize.ts', () => ({
  useElementSize: (_ref: unknown, initial: { w: number; h: number }) => initial,
}));
vi.mock('../../src/components/PhraseBuilder/hooks/useCornerOverlap.ts', () => ({
  useCornerOverlap: () => ({ w: 0, h: 0 }),
}));
vi.mock('../../src/components/PhraseBuilder/hooks/useOverlapResolution.ts', () => ({
  useOverlapResolution: () => {},
}));
vi.mock('../../src/components/PhraseBuilder/PhraseSidebar.tsx', () => ({
  PhraseSidebar: () => <div data-testid="words-panel" />,
}));
// The connector overlay measures elements that are all 0×0 here; the links themselves are state.
vi.mock('../../src/components/PhraseBuilder/hooks/useConnectors.ts', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, useConnectors: () => ({ ...blankConnectors() }) };
});

Element.prototype.setPointerCapture = () => {};

function blankConnectors() {
  const map = () => ({ current: new Map() });
  return {
    workspaceRef: { current: null },
    boxEls: map(),
    sourceAnchorEls: map(),
    targetAnchorEls: map(),
    borderAnchorEls: map(),
    verbAnchorEls: map(),
    bumpGeom: () => {},
    connectors: [],
  };
}

const concept = (id: string, role: GrammaticalRole, extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: id,
  label: id.toLowerCase(),
  ...extra,
});

const CAT = concept('CAT', 'noun');
const SLEEP = concept('SLEEP', 'verb', { transitivity: 'intransitive' });
const CONCEPTS = { noun: [CAT], pronoun: [], verb: [SLEEP], adjective: [], adverb: [] };

/** A workspace of `n` periods, the first filled so it has something to act on. */
function renderWorkspace(selections: PhraseContainer['selection'][]) {
  const state = { containers: [] as PhraseContainer[], links: [] as PhraseLink[] };
  function Harness() {
    const [containers, setContainers] = useState<PhraseContainer[]>(() =>
      selections.map((selection, i) => ({ id: `c${i + 1}`, selection })),
    );
    const [links, setLinks] = useState<PhraseLink[]>([]);
    state.containers = containers;
    state.links = links;
    return (
      <PhraseWorkspace
        containers={containers}
        links={links}
        setContainers={setContainers}
        setLinks={setLinks}
        wordsPanelOpen={false}
        onWordsPanelClose={() => {}}
      />
    );
  }
  const view = renderWithProviders(
    <KeyboardProvider>
      <Harness />
    </KeyboardProvider>,
    { concepts: CONCEPTS },
  );
  return { ...view, state };
}

const cards = () => Array.from(document.querySelectorAll<HTMLElement>('[data-kb-period]'));
const card = (i: number) => cards()[i]!;
const boxNode = (slot: string, root: ParentNode = document) =>
  root.querySelector<HTMLElement>(`[data-kb-box="${slot}"]`)!;

const press = (key: string, held: { shiftKey?: boolean } = {}) => {
  act(() => {
    fireEvent.keyDown(document.activeElement ?? document.body, { key, ...held });
  });
};
const focus = (el: HTMLElement) => act(() => el.focus());

describe('stepping out to the period', () => {
  it('lands on the card the box is in, and goes back in on ↵', () => {
    renderWorkspace([{ subject: CAT, verb: SLEEP }]);
    focus(boxNode('verb', card(0)));

    press('Escape');
    expect(card(0)).toHaveFocus();
    expect(card(0)).toHaveAttribute('data-kb-scope', 'period');

    press('Enter');
    // Back to the box the cursor was last on in this period, not to the top of it.
    expect(boxNode('verb', card(0))).toHaveFocus();
  });

  it('moves between periods with the arrows, at the period’s own level', () => {
    renderWorkspace([{ subject: CAT, verb: SLEEP }, {}, {}]);
    focus(card(0));

    press('ArrowDown');
    expect(card(1)).toHaveFocus();

    press('ArrowDown');
    expect(card(2)).toHaveFocus();

    // The stack ends: there is nowhere below to go.
    press('ArrowDown');
    expect(card(2)).toHaveFocus();

    press('ArrowUp');
    expect(card(1)).toHaveFocus();
  });

  it('moves the period itself with ⇧ and an arrow', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }, {}]);
    focus(card(1));

    press('ArrowDown', { shiftKey: true });
    expect(state.containers.map((c) => c.id)).toEqual(['c1', 'c2']);

    press('ArrowUp', { shiftKey: true });
    expect(state.containers.map((c) => c.id)).toEqual(['c2', 'c1']);
  });
});

// Every target of the pick in flight is numbered where it sits, whatever kind of pick it is —
// a period card for the clause-level relations, a noun box for a relative clause.
describe('numbered pick targets', () => {
  const marked = () => Array.from(document.querySelectorAll('[data-kb-pick-target]'));
  const indices = () => marked().map((el) => el.getAttribute('data-kb-pick-index'));

  it('numbers the eligible periods in the order they stand', () => {
    renderWorkspace([{ subject: CAT, verb: SLEEP }, { subject: CAT }, { subject: CAT }]);
    focus(card(0));

    press('i');

    // The badge rides the card's own paper, which is what a user sees numbered.
    expect(indices()).toEqual(['1', '2']);
    expect(card(1).contains(marked()[0]!)).toBe(true);
    expect(card(2).contains(marked()[1]!)).toBe(true);
  });

  it('takes the one its digit names', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }, { subject: CAT }, { subject: CAT }]);
    focus(card(0));

    press('i');
    press('2');

    expect(state.links[0]).toMatchObject({
      kind: 'conditional',
      source: { containerId: 'c1' },
      target: { containerId: 'c3' },
    });
  });

  it('numbers the nouns of the other period for a relative clause', () => {
    renderWorkspace([
      { subject: CAT, verb: SLEEP },
      { subject: CAT, verb: SLEEP },
    ]);
    focus(boxNode('subject', card(0)));

    // R on a noun starts the pick from it; the nouns it could describe are in the other period.
    press('r');

    expect(indices()).toEqual(['1']);
    expect(marked()[0]).toBe(boxNode('subject', card(1)));
  });

  it('leaves no numbers behind once the pick is over', () => {
    renderWorkspace([{ subject: CAT, verb: SLEEP }, { subject: CAT }]);
    focus(card(0));
    press('i');
    expect(indices()).toEqual(['1']);

    press('Escape');

    expect(indices()).toEqual([]);
  });
});

describe('the keys on a period', () => {
  it('adds one more period on N', () => {
    const { state } = renderWorkspace([{}]);
    focus(card(0));

    press('n');

    expect(state.containers).toHaveLength(2);
  });

  it('removes the period on ⌫, and clears the only one in place', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }, {}]);
    focus(card(1));

    press('Backspace');
    expect(state.containers).toHaveLength(1);

    focus(card(0));
    press('Backspace');
    expect(state.containers).toHaveLength(1);
    expect(state.containers[0]!.selection).toEqual({});
  });

  it('turns the period into a command on C, and into a citation on T', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }]);
    focus(card(0));

    press('c');
    expect(state.containers[0]!.selection.imperative).toBe(true);

    // Both moods take the finite slot, so the second turns the first off.
    press('t');
    expect(state.containers[0]!.selection.imperative).toBeFalsy();
    expect(state.containers[0]!.selection.infinitive).toBe(true);
  });

  it('starts an if-condition on I and drops it on the second I', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }, { subject: CAT }]);
    focus(card(0));

    press('i');
    // The pick is in flight: the banner is up and the other period is a target.
    expect(screen.getByTestId('pick-banner')).toBeInTheDocument();

    focus(card(1));
    press('1');
    expect(state.links.map((l) => l.kind)).toEqual(['conditional']);

    focus(card(0));
    press('i');
    expect(state.links).toEqual([]);
  });

  it('joins two periods on J, through the conjunction menu', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }, { subject: CAT }]);
    focus(card(0));

    // J asks for the conjunction first — one letter each — and only then for the second clause.
    press('j');
    press('b');
    expect(screen.getByTestId('pick-banner')).toBeInTheDocument();

    focus(card(1));
    press('1');

    expect(state.links.map((l) => l.kind)).toEqual(['coordinative']);
    expect(state.links[0]).toMatchObject({ conjunction: 'but' });
  });

  it('abandons a pick on esc', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }, { subject: CAT }]);
    focus(card(0));

    press('i');
    expect(screen.getByTestId('pick-banner')).toBeInTheDocument();

    press('Escape');

    expect(screen.queryByTestId('pick-banner')).not.toBeInTheDocument();
    expect(state.links).toEqual([]);
  });

  // The mood keys read the same letters the box level reads for other things — which is the whole
  // point of the levels: C is the command here and the coordination on a noun.
  it('is the period’s keys, not the box’s', () => {
    const { state } = renderWorkspace([{ subject: CAT, verb: SLEEP }]);
    focus(card(0));

    press('n');

    expect(state.containers).toHaveLength(2);
    expect(state.containers[0]!.selection.subjectNumber).toBeUndefined();
  });
});

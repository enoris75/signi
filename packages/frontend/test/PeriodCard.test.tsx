import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import type { PhraseSelection, WorkspaceBinding } from '../src/components/PhraseBuilder/interfaces.ts';
import { PeriodCard, type PeriodCardProps } from '../src/components/PhraseBuilder/PeriodCard.tsx';
import { renderWithProviders } from './render.tsx';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };

// jsdom implements no pointer capture, which the card's border drag takes on every press.
Element.prototype.setPointerCapture = () => {};

// A workspace binding whose clause-level relations are as given, and every hook a spy.
function binding({ conditional = {}, coordinative = {} }: { conditional?: object; coordinative?: object } = {}) {
  const relation = (over: object) => ({
    hasSource: false,
    hasTarget: false,
    isPickTarget: false,
    onStart: vi.fn(),
    onClear: vi.fn(),
    onPick: vi.fn(),
    ...over,
  });
  return {
    containerId: 'c1',
    pickActive: false,
    geometry: { registerBorderAnchor: vi.fn() },
    conditional: relation(conditional),
    coordinative: relation(coordinative),
    instrumental: { ...relation({}), level: 'object', onLevelChange: vi.fn() },
  } as unknown as WorkspaceBinding;
}

function renderCard(props: Partial<PeriodCardProps> = {}, selection: PhraseSelection = { subject: CAT }) {
  const all: PeriodCardProps = {
    selection,
    compact: false,
    showCanvas: true,
    hasGroups: true,
    hasContent: true,
    soleContainer: false,
    onToggleCompact: vi.fn(),
    onTidy: vi.fn(),
    onToggleImperative: vi.fn(),
    onToggleInfinitive: vi.fn(),
    graphHeight: 340,
    onGraphHeightChange: vi.fn(),
    children: <div data-testid="canvas" />,
    ...props,
  };
  return { ...renderWithProviders(<PeriodCard {...all} />), props: all };
}

const COMMAND = 'Command';
const CITATION = 'Infinitive phrase';

describe('PeriodCard', () => {
  it('wears the canvas and the page’s words panel', () => {
    renderCard({ sidebar: <div data-testid="words-panel" />, binding: binding() });

    expect(screen.getByTestId('period-container')).toHaveAttribute('data-container-id', 'c1');
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('words-panel')).toBeInTheDocument();
  });

  it('flips the moods', () => {
    const { props } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: COMMAND }));
    fireEvent.click(screen.getByRole('button', { name: CITATION }));

    expect(props.onToggleImperative).toHaveBeenCalledOnce();
    expect(props.onToggleInfinitive).toHaveBeenCalledOnce();
  });

  it.each([
    ['an IF clause', { conditional: { hasTarget: true } }],
    ['a conditional’s main clause', { conditional: { hasSource: true } }],
    ['a coordination’s first clause', { coordinative: { hasSource: true } }],
    ['a coordination’s second clause', { coordinative: { hasTarget: true } }],
  ])('locks both moods on %s', (_what, relations) => {
    renderCard({ binding: binding(relations) });

    expect(screen.getByRole('button', { name: COMMAND })).toBeDisabled();
    expect(screen.getByRole('button', { name: CITATION })).toBeDisabled();
  });

  it('leaves the moods free on a period in no relation, or on a standalone one', () => {
    const { unmount } = renderCard({ binding: binding() });
    expect(screen.getByRole('button', { name: COMMAND })).toBeEnabled();
    unmount();

    renderCard();
    expect(screen.getByRole('button', { name: CITATION })).toBeEnabled();
  });

  it('resizes the canvas from its bottom edge in full view, and remembers the height', () => {
    const { props } = renderCard();

    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowDown' });

    expect(props.onGraphHeightChange).toHaveBeenCalledWith(356);
    expect(localStorage.getItem('signi:graphHeight')).toBe('356');
  });

  it('has no resize grip in compact view, whose canvas hugs its words', () => {
    renderCard({ compact: true });

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('floats a standalone card dragged by its border, but keeps a workspace card in the stack', () => {
    const drag = () => {
      const card = screen.getByTestId('period-container');
      fireEvent.pointerDown(card.firstElementChild!, { clientX: 2, clientY: 2 });
      fireEvent.pointerMove(card.firstElementChild!, { clientX: 42, clientY: 32 });
      return card;
    };

    const { unmount } = renderCard();
    expect(drag()).toHaveStyle({ position: 'fixed', left: '40px', top: '30px' });
    unmount();

    renderCard({ binding: binding() });
    expect(drag()).toHaveStyle({ position: 'relative' });
  });
});

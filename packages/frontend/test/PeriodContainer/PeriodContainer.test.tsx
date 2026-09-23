import { describe, expect, it, vi } from 'vitest';
import { createRef, useState } from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import {
  PeriodContainer,
  type PeriodContainerProps,
} from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx';
import { renderWithProviders } from '../render.tsx';
import { place } from '../hooks/dom.ts';
import {
  cond,
  conditionalControl,
  coord,
  coordinativeControl,
  DIVIDER,
  INFO,
  inst,
  instrumentalControl,
  mood,
  PRIMARY,
  SECONDARY,
  SUCCESS,
  TEXT_SECONDARY,
  WARNING,
} from './fixtures.ts';

// A sole, empty, standalone period with its canvas drawn and nothing on the border. Each part of the
// card has its own suite beside this one; these tests cover how the card puts the parts together.
function renderPeriod(overrides: Partial<PeriodContainerProps> = {}) {
  const props: PeriodContainerProps = {
    paperPad: 2,
    compact: false,
    showCanvas: true,
    hasGroups: false,
    hasContent: false,
    soleContainer: true,
    floatable: false,
    position: null,
    onPositionChange: vi.fn(),
    onToggleCompact: vi.fn(),
    onTidy: vi.fn(),
    children: <div data-testid="canvas" />,
    ...overrides,
  };
  const view = renderWithProviders(<PeriodContainer {...props} />);
  return { ...view, props };
}

// The card is the Paper the period's content sits in.
function card() {
  return screen.getByTestId('canvas').parentElement!;
}

describe('PeriodContainer', () => {
  describe('header', () => {
    it('captions the period by the part it plays', () => {
      renderPeriod({ imperative: mood(true) });

      expect(screen.getByText('· click a slot and then choose a word').parentElement).toHaveTextContent(
        /^Command/,
      );
    });

    it('leaves the caption out of the compact view', () => {
      renderPeriod({ compact: true, hasGroups: true, imperative: mood(true) });

      expect(screen.queryByText('Command', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText(/choose/)).not.toBeInTheDocument();
    });

    it('offers the reification switch on an instrument phrase, and reports the level chosen', () => {
      const instrumental = instrumentalControl({ isInstrument: true, level: 'object' });
      renderPeriod({ instrumental });

      fireEvent.click(screen.getByText('Concept'));

      expect(instrumental.onLevelChange).toHaveBeenCalledExactlyOnceWith('concept');
    });

    // The privative (P09-E2): the instrument's own polarity, beside its level.
    it('offers the polarity toggle on an instrument phrase, and reports the denial', () => {
      const instrumental = instrumentalControl({ isInstrument: true, negative: false });
      renderPeriod({ instrumental });

      fireEvent.click(screen.getByTestId('instrument-polarity'));

      expect(instrumental.onNegativeChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('offers no polarity toggle on the clause that acts with the instrument', () => {
      renderPeriod(inst({ hasInstrument: true }));

      expect(screen.queryByTestId('instrument-polarity')).not.toBeInTheDocument();
    });

    it.each<[string, Partial<PeriodContainerProps>]>([
      ['a clause that acts with an instrument', inst({ hasInstrument: true })],
      ['a compact instrument phrase', { compact: true, ...inst({ isInstrument: true }) }],
    ])('offers no reification switch on %s', (_, props) => {
      renderPeriod(props);

      expect(screen.queryByText('Process')).not.toBeInTheDocument();
      expect(screen.queryByText('Object')).not.toBeInTheDocument();
    });

    it.each([false, true])('hands the owner the header controls to measure (compact: %s)', (compact) => {
      const controlsRef = createRef<HTMLDivElement>();
      const { props } = renderPeriod({ compact, hasGroups: true, controlsRef });

      expect(controlsRef.current).toContainElement(screen.getByTestId('period-controls'));
      fireEvent.click(screen.getByTestId('period-tidy'));
      expect(props.onTidy).toHaveBeenCalledOnce();
    });
  });

  describe('border controls', () => {
    it('are left off a period given none', () => {
      renderPeriod();

      expect(screen.queryByTestId('period-border-controls')).not.toBeInTheDocument();
    });

    it('carry the moods and the clause-level relations the period is given', () => {
      renderPeriod({
        imperative: mood(false),
        infinitive: mood(false),
        conditional: conditionalControl(),
        coordinative: coordinativeControl(),
        instrumental: instrumentalControl(),
      });

      expect(within(screen.getByTestId('period-border-controls')).getAllByRole('button')).toHaveLength(4);
    });
  });

  describe('pick target', () => {
    it.each<[string, Partial<PeriodContainerProps>, string]>([
      ['IF condition', cond({ pickActive: true, isPickTarget: true }), WARNING],
      ['coordinated clause', coord({ pickActive: true, isPickTarget: true }), INFO],
      ['instrument', inst({ isPickTarget: true }), SECONDARY],
    ])('lights the card as a droppable %s and takes a click anywhere on it', (_, props, colour) => {
      renderPeriod(props);
      const style = getComputedStyle(card());

      expect(style.borderTopColor).toBe(colour);
      expect(style.borderLeftColor).toBe(colour);
      expect(style.boxShadow).not.toBe('none');
      expect(style.cursor).toBe('pointer');

      fireEvent.click(screen.getByTestId('canvas'));
      const [control] = Object.values(props) as { onPick: () => void }[];
      expect(control.onPick).toHaveBeenCalledOnce();
    });

    it('leaves the card inert while this period is not a target', () => {
      const conditional = conditionalControl({ pickActive: true });
      const coordinative = coordinativeControl({ pickActive: true });
      const instrumental = instrumentalControl();
      renderPeriod({ conditional, coordinative, instrumental });
      const style = getComputedStyle(card());

      fireEvent.click(screen.getByTestId('canvas'));

      expect(conditional.onPick).not.toHaveBeenCalled();
      expect(coordinative.onPick).not.toHaveBeenCalled();
      expect(instrumental.onPick).not.toHaveBeenCalled();
      expect(style.borderTopColor).toBe(DIVIDER);
      expect(style.boxShadow).toBe('none');
      expect(style.cursor).not.toBe('pointer');
    });
  });

  describe('card accent', () => {
    it.each<[string, Partial<PeriodContainerProps>, string]>([
      ['a free statement', {}, TEXT_SECONDARY],
      ['a main clause', cond({ hasCondition: true }), WARNING],
      ['an IF clause', cond({ isIfClause: true }), WARNING],
      ['a first clause', coord({ hasCoordination: true }), INFO],
      ['a coordinated clause', coord({ isCoordinated: true }), INFO],
      ['an instrument phrase', inst({ isInstrument: true }), SECONDARY],
      ['a command', { imperative: mood(true) }, SUCCESS],
      ['an infinitive', { infinitive: mood(true) }, PRIMARY],
    ])('rules the left edge of %s in its colour', (_, props, colour) => {
      renderPeriod(props);

      expect(getComputedStyle(card()).borderLeftColor).toBe(colour);
    });

    it('frees a right gutter for the connector of a relation the period takes part in', () => {
      renderPeriod(cond({ isIfClause: true }));

      expect(getComputedStyle(card()).marginRight).toBe('64px');
    });

    it('keeps no gutter on a period outside any relation', () => {
      renderPeriod({
        conditional: conditionalControl(),
        coordinative: coordinativeControl(),
        instrumental: instrumentalControl(),
      });

      expect(getComputedStyle(card()).marginRight).toBe('0px');
    });
  });

  describe('border drag', () => {
    // A 400×300 card at (100, 100). jsdom has no pointer capture, so the card gets a stub.
    function renderFloating(overrides: Partial<PeriodContainerProps> = {}) {
      const view = renderPeriod({ floatable: true, position: { x: 40, y: 60 }, ...overrides });
      const paper = place(card(), 100, 100, 400, 300);
      paper.setPointerCapture = vi.fn();
      return { ...view, paper };
    }

    it('floats a floatable card by its border', () => {
      const { paper, props } = renderFloating();

      fireEvent.pointerDown(paper, { clientX: 497, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: 527, clientY: 230 });

      expect(paper.setPointerCapture).toHaveBeenCalledExactlyOnceWith(3);
      expect(props.onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 70, y: 40 });
    });

    it('does not drag a card that sits in the workspace stack', () => {
      const { paper, props } = renderFloating({ floatable: false });

      fireEvent.pointerDown(paper, { clientX: 103, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: 133, clientY: 250 });

      expect(props.onPositionChange).not.toHaveBeenCalled();
    });

    it('does not start from a press on the border controls', () => {
      const { props } = renderFloating({ imperative: mood(false) });
      const control = screen.getByRole('button', { name: 'Command' });

      fireEvent.pointerDown(control, { clientX: 497, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(card(), { clientX: 527, clientY: 250 });

      expect(props.onPositionChange).not.toHaveBeenCalled();
    });

    it('grabs while a drag lasts, and lets go when it ends', () => {
      // The owner holds the position, so the card re-renders at each reported move.
      function Floating() {
        const [position, setPosition] = useState<{ x: number; y: number } | null>({ x: 40, y: 60 });
        return (
          <PeriodContainer
            paperPad={2}
            compact={false}
            showCanvas
            hasGroups={false}
            hasContent={false}
            soleContainer
            floatable
            position={position}
            onPositionChange={setPosition}
            onToggleCompact={() => {}}
            onTidy={() => {}}
          >
            <div data-testid="canvas" />
          </PeriodContainer>
        );
      }
      renderWithProviders(<Floating />);
      const paper = place(card(), 100, 100, 400, 300);
      paper.setPointerCapture = vi.fn();
      expect(getComputedStyle(paper).cursor).toBe('default');

      fireEvent.pointerDown(paper, { clientX: 103, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: 133, clientY: 270 });
      expect(getComputedStyle(paper).cursor).toBe('grabbing');

      fireEvent.pointerUp(paper, { clientX: 133, clientY: 270 });
      expect(getComputedStyle(paper).cursor).toBe('default');
    });

    it('leaves the cursor alone on a card in the page flow', () => {
      renderPeriod({ floatable: true, position: null });

      expect(getComputedStyle(card()).cursor).toBe('auto');
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import {
  BorderControls,
  type BorderControlsProps,
} from '../../src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx';
import { renderWithProviders } from '../render.tsx';
import { conditionalControl, coordinativeControl, mood, subordinateControl } from './fixtures.ts';

function renderControls(props: BorderControlsProps) {
  const onCardPointerDown = vi.fn();
  const view = renderWithProviders(
    <div onPointerDown={onCardPointerDown}>
      <BorderControls {...props} />
    </div>,
  );
  return { ...view, onCardPointerDown };
}

describe('BorderControls', () => {
  it('leaves the border bare for a period given no controls', () => {
    renderControls({});

    expect(screen.queryByTestId('period-border-controls')).not.toBeInTheDocument();
  });

  it('stacks the moods on top, then the conditional, the coordinative and the subordinate clause', () => {
    renderControls({
      subordinate: subordinateControl(),
      coordinative: coordinativeControl(),
      conditional: conditionalControl(),
      question: mood(false),
      infinitive: mood(false),
      imperative: mood(false),
    });

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Command',
      'Infinitive phrase',
      // The third mood, right after the infinitive (P09-E12 M5).
      'Question',
      'Add a condition (this period becomes the main clause)',
      'Coordinate this period',
      'Add a subordinate clause',
    ]);
  });

  it('shows only the controls it is given', () => {
    renderControls({ imperative: mood(false) });

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('registers the cluster as the connector anchor, and releases it', () => {
    const conditional = conditionalControl();
    const { unmount } = renderControls({ conditional, imperative: mood(false) });

    const anchor = vi.mocked(conditional.registerBorderAnchor).mock.calls[0][0]!;
    expect(anchor).toBe(screen.getByTestId('period-border-controls'));
    expect(anchor).toContainElement(
      screen.getByRole('button', { name: 'Command' }),
    );

    unmount();
    expect(conditional.registerBorderAnchor).toHaveBeenLastCalledWith(null);
  });

  it('keeps a press on a control from reaching the card', () => {
    const { onCardPointerDown } = renderControls({ imperative: mood(false) });

    fireEvent.pointerDown(screen.getByRole('button'));

    expect(onCardPointerDown).not.toHaveBeenCalled();
  });
});

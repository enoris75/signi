import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import {
  BorderControls,
  type BorderControlsProps,
} from '../../src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx';
import { renderWithProviders } from '../render.tsx';
import { conditionalControl, coordinativeControl, mood } from './fixtures.ts';

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

  it('stacks the moods on top, then the conditional, then the coordinative', () => {
    renderControls({
      coordinative: coordinativeControl(),
      conditional: conditionalControl(),
      infinitive: mood(false),
      imperative: mood(false),
    });

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Toggle imperative (command)',
      'Toggle infinitive phrase (citation)',
      'Add a condition (this period becomes the main clause)',
      'Coordinate this period',
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
      screen.getByRole('button', { name: 'Toggle imperative (command)' }),
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

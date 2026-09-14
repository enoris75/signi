import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { AbstractionLevel } from '@signi/shared';
import { ReificationSwitch } from '../../src/components/PhraseBuilder/PeriodContainer/ReificationSwitch.tsx';
import { renderWithProviders } from '../render.tsx';
import { PAPER, SECONDARY } from './fixtures.ts';

function renderSwitch(level: AbstractionLevel = 'object') {
  const onChange = vi.fn();
  renderWithProviders(<ReificationSwitch level={level} onChange={onChange} />);
  return { onChange };
}

describe('ReificationSwitch', () => {
  it('offers the three levels, each explained by an example', () => {
    renderSwitch();

    expect(screen.getByLabelText('Start by choosing a word')).toHaveTextContent('Process');
    expect(screen.getByLabelText('Start with the choosing of a word')).toHaveTextContent('Concept');
    expect(screen.getByLabelText('Start with a word')).toHaveTextContent('Object');
  });

  it('reports the level clicked', () => {
    const { onChange } = renderSwitch('object');

    fireEvent.click(screen.getByText('Concept'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('concept');
  });

  it('highlights the current level', () => {
    renderSwitch('process');

    expect(getComputedStyle(screen.getByText('Process')).backgroundColor).toBe(SECONDARY);
    expect(getComputedStyle(screen.getByText('Concept')).backgroundColor).toBe(PAPER);
    expect(getComputedStyle(screen.getByText('Object')).backgroundColor).toBe(PAPER);
  });
});

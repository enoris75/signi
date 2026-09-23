import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { PrivativeSwitch } from '../../src/components/PhraseBuilder/PeriodContainer/PrivativeSwitch.tsx';
import { renderWithProviders } from '../render.tsx';
import { PAPER, SECONDARY } from './fixtures.ts';

function renderSwitch(negative = false) {
  const onChange = vi.fn();
  renderWithProviders(<PrivativeSwitch negative={negative} onChange={onChange} />);
  return { onChange };
}

// The instrument's polarity (P09-E2): positive is the plain means, negative the privative "without".
// It says the verb's own two words, under the satellite's name.
describe('PrivativeSwitch', () => {
  it('names itself the polarity and says the one the instrument has', () => {
    renderSwitch();

    expect(screen.getByLabelText('Polarity')).toHaveTextContent('Positive');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('flips the polarity it is clicked on', () => {
    const plain = renderSwitch(false);
    fireEvent.click(screen.getByText('Positive'));
    expect(plain.onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('takes a denial back', () => {
    const denied = renderSwitch(true);
    fireEvent.click(screen.getByText('Negative'));
    expect(denied.onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('highlights a denied instrument', () => {
    renderSwitch(true);
    expect(getComputedStyle(screen.getByText('Negative')).backgroundColor).toBe(SECONDARY);
  });

  it('leaves a plain one unhighlighted', () => {
    renderSwitch(false);
    expect(getComputedStyle(screen.getByText('Positive')).backgroundColor).toBe(PAPER);
  });
});
